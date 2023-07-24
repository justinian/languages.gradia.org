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


def build_language(lang, env, ctx):
    import shutil
    from json import dump

    root = lang["dir"]
    output = lang["output"]
    slug = lang["slug"]
    logging.info("Building language %s", lang["name"])

    shutil.copy(root / "info.json", output / "info.json")
    shutil.copy(root / f"{slug}.html", output / "grammar.html")

    words = parse_dictionary(root / f"{slug}.csv")
    with open(output / "dict.json", "w") as outfile:
        dump(words, outfile)


def write_info_file(languages, output):
    from json import dump
    logging.info("Writing languages.json with %d entries", len(languages))
    with open(output / "languages.json", "w") as outfile:
        dump(languages, outfile)


def build_pages(pages, output, env, ctx):
    from glob import glob
    from os import makedirs
    from pathlib import Path

    for f in glob(str(pages / '**.html'), recursive=True):
        infilename = Path(f).relative_to(pages)
        outfilename = output / infilename
        logging.info("Rendering %s", outfilename)
        makedirs(outfilename.parent, exist_ok=True)
        with open(f, "r") as infile, open(outfilename, "w") as outfile:
            template = env.from_string(infile.read())
            outfile.write(template.render(ctx))


def find_languages(root, output):
    import os
    from json import load

    infos = {}
    for lang in os.listdir(root):
        lang_dir = root / lang
        lang_out = output / lang
        os.makedirs(lang_out)

        with open(lang_dir / "info.json", "r") as infofile:
            info = load(infofile)
            info["dir"] = lang_dir
            info["output"] = lang_out
            infos[info["slug"]] = info

    return infos


def build_site(root, output):
    import shutil
    from jinja2 import Environment, FileSystemLoader, select_autoescape

    logging.info("Installing static content into %s", output)
    shutil.rmtree(output, ignore_errors=True)
    shutil.copytree(root / "static", output)

    languages = find_languages(
        root / "languages",
        output / "languages")

    env = Environment(
        loader=FileSystemLoader(root / "templates"),
        autoescape=select_autoescape())

    for lang in languages.values():
        build_language(lang, env, dict(languages=languages))

    build_pages(
        root / "pages",
        output,
        env,
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