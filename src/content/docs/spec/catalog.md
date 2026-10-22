---
title: Catalog
description: The bases, desktops, apps, languages and keyboard layouts a spec can name, as the pipeline's catalog lists them at v0.9.1.
---

The catalog is the list of what the pipeline knows how to build: bases, desktops, apps, languages and keyboard layouts. It lives in [catalog.yaml](https://github.com/Eric-Ness/linuxlive/blob/main/linuxlive/data/catalog.yaml) in the pipeline's repository. The tables below are from v0.9.1.

## Bases

| `base` | Label | Release | Starts from | Live boot |
| --- | --- | --- | --- | --- |
| `ubuntu` | Ubuntu 26.04 LTS | 26.04 | the official `ubuntu:26.04` container image; the desktop is installed with apt | casper |
| `fedora` | Fedora 44 | 44 | Fedora's Atomic (bootc) image for the desktop | dracut's dmsquash-live, with SELinux enforcing |

On Ubuntu, Firefox, Thunderbird and snapd from Ubuntu's archive are never installed, because they install snaps, which cannot run in a container build; apps come from Flathub instead. Fedora images swap `fedora-logos` for Fedora's own neutral `generic-logos`.

Both bases build for `amd64` and `arm64` (see [arches](/spec/reference/#arches)).

## Desktops

Every desktop is available on both bases.

| `desktop` | Label | On Ubuntu | On Fedora |
| --- | --- | --- | --- |
| `gnome` | GNOME | Ubuntu's minimal GNOME desktop (`ubuntu-desktop-minimal`) with GNOME Software and its Flatpak plugin | the Fedora Silverblue 44 image |
| `kde` | KDE Plasma | Plasma with SDDM, Discover and its Flatpak backend, Konsole and Dolphin | the Fedora Kinoite 44 image |
| `cinnamon` | Cinnamon | `cinnamon-core` with LightDM, the slick greeter, X11 and GNOME Software | Fedora's `base-atomic` 44 image (the one Silverblue and Kinoite are built from) plus Cinnamon, LightDM, GNOME Terminal and GNOME Software |

Cinnamon runs as an X11 session on both bases. CI builds and boots GNOME on Ubuntu, KDE Plasma on Fedora and Cinnamon on both. GNOME on Fedora and KDE Plasma on Ubuntu compile and are covered by the unit tests, but are not boot-tested in CI.

## Apps

Apps are installed from [Flathub](https://flathub.org/), so one id works on both bases. Use the id in the first column in `apps`. For any app not listed here, put its Flathub ID in `flathub` instead.

| App id | Name | Flathub ID | ARM64 |
| --- | --- | --- | --- |
| `firefox` | Firefox | `org.mozilla.firefox` | yes |
| `chromium` | Chromium | `org.chromium.Chromium` | yes |
| `thunderbird` | Thunderbird | `org.mozilla.thunderbird` | no |
| `libreoffice` | LibreOffice | `org.libreoffice.LibreOffice` | yes |
| `vlc` | VLC | `org.videolan.VLC` | yes |
| `gimp` | GIMP | `org.gimp.GIMP` | yes |
| `inkscape` | Inkscape | `org.inkscape.Inkscape` | yes |
| `krita` | Krita | `org.kde.krita` | yes |
| `blender` | Blender | `org.blender.Blender` | no |
| `audacity` | Audacity | `org.audacityteam.Audacity` | yes |
| `obs-studio` | OBS Studio | `com.obsproject.Studio` | no |
| `kdenlive` | Kdenlive | `org.kde.kdenlive` | yes |
| `vscode` | Visual Studio Code | `com.visualstudio.code` | yes |
| `steam` | Steam | `com.valvesoftware.Steam` | no |
| `lutris` | Lutris | `net.lutris.Lutris` | no |
| `heroic` | Heroic Games Launcher | `com.heroicgameslauncher.hgl` | no |
| `discord` | Discord | `com.discordapp.Discord` | no |
| `gcompris` | GCompris | `org.kde.gcompris` | yes |
| `tuxpaint` | Tux Paint | `org.tuxpaint.Tuxpaint` | yes |
| `flatseal` | Flatseal | `com.github.tchx84.Flatseal` | yes |

"ARM64: no" means Flathub builds that app for x86_64 only, so a spec with `arm64` in `arches` cannot list it. Firefox and Chromium start in their own kiosk modes when they are the [kiosk](/spec/reference/#kiosk) app.

Each app makes the ISO bigger, because its Flatpak runtime comes too. Apps that share a runtime (most KDE apps, for example) cost less together. Thunderbird's Flathub ID changed to `org.mozilla.thunderbird` in v0.6.0.

## Languages

Values for `settings.language`. The Ubuntu and Fedora columns are the language packs each base installs.

| `language` | Label | Ubuntu packs | Fedora langpack |
| --- | --- | --- | --- |
| `en_US` | English (United States) | `en` | `en` |
| `en_GB` | English (United Kingdom) | `en` | `en_GB` |
| `en_CA` | English (Canada) | `en` | `en` |
| `en_AU` | English (Australia) | `en` | `en` |
| `de_DE` | Deutsch (Deutschland) | `de` | `de` |
| `de_AT` | Deutsch (Österreich) | `de` | `de` |
| `de_CH` | Deutsch (Schweiz) | `de` | `de` |
| `fr_FR` | Français (France) | `fr` | `fr` |
| `fr_CA` | Français (Canada) | `fr` | `fr` |
| `es_ES` | Español (España) | `es` | `es` |
| `es_MX` | Español (México) | `es` | `es` |
| `it_IT` | Italiano | `it` | `it` |
| `pt_BR` | Português (Brasil) | `pt` | `pt_BR` |
| `pt_PT` | Português (Portugal) | `pt` | `pt` |
| `nl_NL` | Nederlands | `nl` | `nl` |
| `sv_SE` | Svenska | `sv` | `sv` |
| `da_DK` | Dansk | `da` | `da` |
| `nb_NO` | Norsk bokmål | `nb` | `nb` |
| `fi_FI` | Suomi | `fi` | `fi` |
| `pl_PL` | Polski | `pl` | `pl` |
| `cs_CZ` | Čeština | `cs` | `cs` |
| `tr_TR` | Türkçe | `tr` | `tr` |
| `uk_UA` | Українська | `uk` | `uk` |
| `ru_RU` | Русский | `ru` | `ru` |
| `ja_JP` | 日本語 | `ja` | `ja` |
| `zh_CN` | 中文（简体） | `zh-hans` | `zh_CN` |
| `ko_KR` | 한국어 | `ko` | `ko` |

On Ubuntu the build installs `language-pack-<pack>`, plus `language-pack-gnome-<pack>` on GNOME and Cinnamon, `language-pack-kde-<pack>` on KDE, and `cinnamon-l10n` on Cinnamon. Japanese, Chinese and Korean also get `fonts-noto-cjk` on Ubuntu. On Fedora it installs `langpacks-<langpack>`.

## Keyboards

Values for `settings.keyboard`, as XKB layout names.

| `keyboard` | Layout |
| --- | --- |
| `us` | English (US) |
| `gb` | English (UK) |
| `ie` | Irish |
| `de` | German |
| `ch` | Swiss German |
| `fr` | French |
| `be` | Belgian |
| `ca` | French (Canada) |
| `es` | Spanish |
| `latam` | Spanish (Latin American) |
| `it` | Italian |
| `pt` | Portuguese |
| `br` | Portuguese (Brazil) |
| `nl` | Dutch |
| `se` | Swedish |
| `dk` | Danish |
| `no` | Norwegian |
| `fi` | Finnish |
| `pl` | Polish |
| `cz` | Czech |
| `tr` | Turkish |
| `ua` | Ukrainian |
| `ru` | Russian |
| `jp` | Japanese |
| `kr` | Korean |

:::caution
Quote `no` in your spec: `keyboard: "no"`. YAML reads a bare `no` as false, and the check then fails.
:::

## Adding to the catalog

New apps, languages and layouts are welcome as pull requests to the pipeline. Add the entry to `catalog.yaml`, then run `python scripts/check_catalog.py`, which needs a network connection, to confirm that every package, image and Flatpak named there exists upstream and that each app's CPUs match Flathub's. [CONTRIBUTING.md](https://github.com/Eric-Ness/linuxlive/blob/main/CONTRIBUTING.md) says what a pull request needs.
