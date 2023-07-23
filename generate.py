#!/usr/bin/env python

import click
import logging

def parse_dictionary(csvfile):
    from csv import DictReader

    with open(csvfile, encoding="utf-8-sig") as input_file:
        csv = DictReader(input_file)
        csv.fieldnames[0] = "word"
        csv.fieldnames[1] = "pronunciation"
        csv.fieldnames[2] = "pos"
        csv.fieldnames[3] = "definition"
        return [val for val in csv]


def build_language(name, root, output):
    import shutil
    from json import dump, load
    logging.info("Building language %s", name)
    shutil.copy(root / "info.json", output / "info.json")

    info = {}
    with open(root / "info.json", "r") as infofile:
        info = load(infofile)

    words = parse_dictionary(root / f"{name}.csv")
    with open(output / "dict.json", "w") as outfile:
        dump(words, outfile)

    return info

def write_info_file(languages, output):
    from json import dump
    logging.info("Writing languages.json with %d entries", len(languages))
    with open(output / "languages.json", "w") as outfile:
        dump(languages, outfile)


def build_pages(pages, templates, output, ctx):
    from glob import glob
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    from os import makedirs
    from pathlib import Path

    env = Environment(
        loader=FileSystemLoader("templates"),
        autoescape=select_autoescape())

    for f in glob(str(pages / '**.html'), recursive=True):
        infilename = Path(f).relative_to(pages)
        outfilename = output / infilename
        logging.info("Rendering %s", outfilename)
        makedirs(outfilename.parent, exist_ok=True)
        with open(f, "r") as infile, open(outfilename, "w") as outfile:
            template = env.from_string(infile.read())
            outfile.write(template.render(ctx))


def build_site(root, output):
    import os
    import shutil

    logging.info("Installing static content into %s", output)
    shutil.rmtree(output, ignore_errors=True)
    shutil.copytree(root / "static", output)

    lang_root = root / "languages"
    languages = {}
    for lang in os.listdir(lang_root):
        lang_dir = output / "languages" / lang
        os.makedirs(lang_dir)
        languages[lang] = \
            build_language(lang, lang_root / lang, lang_dir)

    build_pages(
        root / "pages",
        root / "templates",
        output,
        {
            "languages": languages,
        })


@click.command
@click.argument("output")
def generate(output="public"):
    from pathlib import Path
    logging.basicConfig(
        format = '%(asctime)s %(levelname)8s  %(message)s',
        datefmt = '%Y-%m-%d %H:%M:%S',
        level = logging.INFO,
    )
    build_site(Path('.'), Path(output))


if __name__ == "__main__":
    generate()