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
    from json import dump
    logging.info("Building language %s", name)
    shutil.copy(root / "info.json", output / "info.json")

    words = parse_dictionary(root / f"{name}.csv")
    with open(output / "dict.json", "w") as outfile:
        dump(words, outfile)


def write_info_file(languages, output):
    from json import dump
    logging.info("Writing languages.json with %d entries", len(languages))
    with open(output / "languages.json", "w") as outfile:
        dump(languages, outfile)


def build_site(root, output):
    import os
    import shutil

    logging.info("Installing static content into %s", output)
    shutil.rmtree(output, ignore_errors=True)
    shutil.copytree(root / "static", output)

    lang_root = root / "languages"
    languages = os.listdir(lang_root)
    for lang in languages:
        lang_dir = output / "languages" / lang
        os.makedirs(lang_dir)
        build_language(lang, lang_root / lang, lang_dir)

    write_info_file(languages, output)


@click.command
@click.argument("output")
def generate(output):
    from pathlib import Path
    logging.basicConfig(
        format = '%(asctime)s %(levelname)8s  %(message)s',
        datefmt = '%Y-%m-%d %H:%M:%S',
        level = logging.INFO,
    )
    build_site(Path('.'), Path(output))


if __name__ == "__main__":
    generate()