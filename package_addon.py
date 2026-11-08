import json
import zipfile

import semver
from pathlib import Path

import yaml


compilation_config = yaml.load( open("compilation_config.yaml", 'r'), yaml.SafeLoader )
ADDON_NAME = compilation_config['ADDON_NAME']

# RP_VERSION = compilation_config['RP_VERSION']
# RP_UUID = compilation_config['RP_UUID']

BP_VERSION = compilation_config['BP_VERSION']

ENGINE_VER = compilation_config['MIN_ENGINE_VERSION']

IS_RELEASE = compilation_config['IS_RELEASE']

ROOT_DIR = Path(__file__).resolve().parent
EXPORT_DIR = ROOT_DIR / "export"
SRC_DIR = ROOT_DIR / "src"

rp_source = SRC_DIR / "cdisc_api_rp"
bp_source = SRC_DIR / "cdisc_api_bp"



def increment_manifest_pack_version( manifest: dict, target_ver: str, release = False) -> str:
    current_version = semver.Version.parse(manifest['header']['version'])
    config_version = semver.Version.parse(target_ver)

    if current_version.replace(prerelease=None).compare(config_version):
        print(f"> Higher version requested in the config, changing from {current_version} to {str(config_version) + "-build.1"}")
        current_version = (str(config_version))
        if not release: current_version += "-build.1"
    else:
        print(f"> Bumping build version from {current_version.prerelease} to {current_version.bump_prerelease(token="build").prerelease}")
        current_version = current_version.bump_prerelease(token="build")

    return str(current_version)


def update_rp_manifest():

    print("=== UPDATING RESOURCE MANIFEST ===")

    with open(rp_source / "manifest.json", "r") as rp_manifest_file:
        manifest = json.load(rp_manifest_file)


        # Set name with version
        manifest['header']['name'] = f"{ADDON_NAME} [RP v.{compilation_config['RP_VERSION']}]"

        # Increment build / set new version of the pack
        current_rp_version = increment_manifest_pack_version(manifest, compilation_config['RP_VERSION'], IS_RELEASE)
        manifest['header']['version'] = current_rp_version

        # Set engine version
        manifest['header']['min_engine_version'] = ENGINE_VER

        # Update module versions
        pack_modules = manifest['modules']
        for module in pack_modules:
            module['version'] = str(current_rp_version)

    with open(rp_source / "manifest.json", "w") as rp_manifest_file:
        # Save changes
        json.dump( manifest, rp_manifest_file, indent=4 )



def update_bp_manifest():

    print("=== UPDATING BEHAVIOR MANIFEST ===")

    with open(bp_source / "manifest.json", "r") as bp_manifest_file:
        manifest = json.load(bp_manifest_file)


        # Set name with version
        manifest['header']['name'] = f"{ADDON_NAME} [BP v.{BP_VERSION}]"

        # Increment build / set new version of the pack
        current_bp_version = increment_manifest_pack_version(manifest, BP_VERSION, IS_RELEASE)
        manifest['header']['version'] = current_bp_version

        # Set engine version
        manifest['header']['min_engine_version'] = ENGINE_VER

        # Update module versions
        pack_modules = manifest['modules']
        for module in pack_modules:
            module['version'] = str(current_bp_version)


        # Update dependencies
        dependencies = []

        if "RP_VERSION" in compilation_config:
            dependencies.append({
                "uuid": compilation_config['RP_UUID'],
                "version": compilation_config['RP_VERSION']
            })
        if "CDISC_VERSION" in compilation_config:
            dependencies.append({
                "uuid": "c4c3b4b2-7514-43c8-b3ce-668588dbac60",
                "version": compilation_config['CDISC_VERSION']
            })
        if "SERVER_VER" in compilation_config:
            dependencies.append({
                "module_name": "@minecraft/server",
                "version": compilation_config['SERVER_VER']
            })
        if "SERVER-UI_VER" in compilation_config:
            dependencies.append({
                "module_name": "@minecraft/server-ui",
                "version": compilation_config['SERVER-UI_VER']
            })

        manifest['dependencies'] = dependencies

    with open(bp_source / "manifest.json", "w") as bp_manifest_file:
        # Save changes
        json.dump( manifest, bp_manifest_file, indent=4 )




if __name__ == '__main__':
    if "RP_VERSION" in compilation_config:
        update_rp_manifest()
    if "BP_VERSION" in compilation_config:
        update_bp_manifest()

    EXPORT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    if compilation_config['SEPARATE_EXPORT']:
        if "RP_VERSION" in compilation_config:
            rp_output = f"{ADDON_NAME} [RP v.{compilation_config['BP_VERSION']}].mcpack"
        if "BP_VERSION" in compilation_config:
            bp_output = f"{ADDON_NAME} [BP v.{compilation_config['BP_VERSION']}].mcpack"

    else:
        output = f"{ADDON_NAME} [v.{compilation_config['ADDON_VERSION']}].mcaddon"

        with zipfile.ZipFile(
            EXPORT_DIR / output,
            "w"
        ) as output_zip:
            for file in SRC_DIR.rglob('[!.]*'):
                output_zip.write(file, arcname=file.relative_to(SRC_DIR))
