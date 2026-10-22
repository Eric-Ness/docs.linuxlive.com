---
title: Changelog
description: What each release of the linuxlive build pipeline added, from v0.1.0 to v0.9.1, newest first.
---

These are the releases of the open-source build pipeline, [Eric-Ness/linuxlive](https://github.com/Eric-Ness/linuxlive), that linuxlive.com and the template build with. A distro repository builds with the release named in its `.github/workflows/build.yml`; see [Pin a release](/spec/github-actions/#pin-a-release). Dates are when each release was tagged.

## v0.9.1 (22 October 2026)

- **Boot splash on BIOS.** The boot menu now starts Linux in a graphical mode on BIOS too, so PCs and virtual machines in BIOS mode (VirtualBox's, for example) show the boot splash as UEFI ones do, instead of the text splash. **safe graphics** still uses text.
- The example boot splash lays itself out again when the screen changes size partway through the boot. Splash scripts should do the same; see [Boot splash](/spec/boot-splash/).
- Every boot mode, BIOS ones included, now keeps its screenshots from before the system is up (`boot-*.png`).

## v0.9.0 (21 October 2026)

- **Boot splashes of your own:** `branding.splash`, a Plymouth script and up to 24 PNG images, replaces the logo over a spinner. The logo is still there for the script, as `watermark.png`. See [Boot splash](/spec/boot-splash/).
- **Pinned dock apps:** `settings.dock` pins up to 12 of the distro's apps after the file manager, in order, on GNOME, KDE Plasma and Cinnamon. See [The dock](/spec/dock/).
- CI checks that the splash's script, images and Plymouth's script plugin are in the initramfs, and that the logged-in user's dock holds exactly the spec's list. Boots that wait for the desktop also keep a few screenshots from before it (`boot-*.png`), where the splash shows.

## v0.8.2 (21 October 2026)

- **Pale wallpapers pass the screenshot check.** A pale or grey wallpaper has almost no colour for the check to look for, so it failed even when it was on screen. Such wallpapers are now matched by their main colours, which must cover half of a screenshot, and the desktop must not be blank.
- The time zone check treats `UTC` and its other names, such as `Etc/UTC`, as the same zone.

## v0.8.1 (18 October 2026)

- **Desktop icons on slow machines.** On Ubuntu with GNOME, the desktop icons (the installer's among them) could fail to appear on slow or emulated machines; they now get 30 seconds to show instead of 3. CI checks that the icons are drawn on Ubuntu GNOME's live desktop.

## v0.8.0 (18 October 2026)

- **ARM64 ISOs** for virtual machines on Apple-silicon Macs (UTM, Parallels, VMware Fusion): `arches: [amd64, arm64]` builds one ISO for each. ARM ISOs boot through UEFI only. In GitHub they build in their own job, `build arm64`.
- The catalog knows which CPUs Flathub builds each app for. A spec with `arm64` that lists an app built only for PCs (Thunderbird, Blender, OBS Studio, Steam, Lutris, Heroic, Discord) is refused when it is checked, not late in the build.
- The installer's icon on Ubuntu GNOME's live desktop opens again: it was shown as untrusted.
- Firefox no longer shows first-run dialogs (terms of use, onboarding, importing, Mozilla's suggestions) over the distro's own home page.
- CI starts every Flatpak app, not just the first, and slow sessions get more time: app starts are retried, and `tuned-ppd` is restarted when `tuned` is slow to answer.

## v0.7.0 (16 October 2026)

- **Save to the USB stick:** `persistence: true` keeps the live system's files, settings and added apps on the stick it runs from, with a second boot entry that starts clean. Ubuntu-based distros only. CI boots a stick twice and checks the second boot finds what the first saved.

## v0.6.0 (16 October 2026)

- **Any app from Flathub:** the new `flathub` list takes Flathub IDs beside the catalog's `apps`. `validate --online`, which the GitHub build now runs first, checks each with Flathub's API. A Flathub app can be the kiosk app.
- Thunderbird's Flathub ID is now `org.mozilla.thunderbird`. `validate --online` warns about an app on a runtime that gets no more updates.

## v0.5.0 (16 October 2026)

- **Settings:** `settings` sets the language (with the base's translations), keyboard layout, time zone, computer name, automatic login on installed systems and menu entries to hide.
- **Firefox's home page and bookmarks:** `firefox`, set as policies for everyone. With bookmarks, Firefox's own defaults are left out.
- **Kiosk mode:** `kiosk` starts one app full screen with no desktop around it. The **Install** boot entry still starts the desktop.
- None of these run code of the spec's own, so a spec with them can still be built with **Build it for me**.
- Flatpak apps start in Ubuntu live sessions, which they did not before; CI now starts one in every live and installed session.
- Five new examples, built and booted by CI, use every option on both bases and all three desktops.

## v0.4.2 (14 October 2026)

- The install test uses a 64 GB disk, so large distros fit.

## v0.4.1 (14 October 2026)

- The Fedora installer's window finds the disks; it found none before.
- Each build is named: `/etc/os-release` gets a `BUILD_ID` of the date and the run number, so a monthly rebuild of one version can be told from the last.

## v0.4.0 (14 October 2026)

- **Extras:** a spec can add its own `packages` from the base's archive, `files` under `/etc` or `/usr`, `scripts` (run while the image is built, at an installed system's first boot, or at each user's first login) and GitHub `repos` built in at an exact commit. CI checks each in the live session and on the installed disk. Repos and their commits are listed in the ISO's package list.

## v0.3.0 (14 October 2026)

- **Fedora-based ISOs install too,** with the same icon, boot entry and installer as Ubuntu's. With `publish-image: true` the build pushes the system image to the repository's packages on ghcr.io, tagged `:latest` once verified. The installer installs from it, so installing needs the internet, and installed systems update from it with `bootc upgrade`.
- KDE's Welcome Center, which showed Fedora's logo, no longer opens, and installed systems no longer show the installer's icon.

## v0.2.0 (13 October 2026)

- **Ubuntu-based ISOs install themselves:** an "Install" icon on the live desktop and an "Install" boot-menu entry open a small installer that erases one whole disk (after you type erase) and installs the system with your user, booting under UEFI with Secure Boot and under BIOS. CI installs both Ubuntu examples unattended and boots the installed disks.

## v0.1.3 (13 October 2026)

- Every ISO comes with `<name>.iso.packages`: each installed package, its version and its source package, so the matching source can be found in Ubuntu's and Fedora's archives.
- The boot check watches the desktop shell until the test ends, and CI fails if it crashes late.

## v0.1.2 (12 October 2026)

- CI fails if any system service fails in the live session.
- Ubuntu ISOs carry `md5sum.txt`, so Ubuntu's own medium check passes.
- `mcelog` no longer starts, and fails, in virtual machines on Fedora.
- Live sessions start no update notifiers, and KDE's welcome window no longer offers an installer the image does not have.

## v0.1.1 (12 October 2026)

- Ubuntu's and Fedora's logos, which are their trademarks, are replaced: Fedora images use Fedora's neutral `generic-logos`, KDE's launcher shows the distro's logo, Ubuntu's dock shows GNOME's grid icon for Show Apps, and text consoles name the distro.
- CI reports a desktop shell that crashes after login.

## v0.1.0 (11 October 2026)

- The first release. A spec compiles to a container build for Ubuntu 26.04 or Fedora 44, with GNOME, KDE Plasma or Cinnamon, Flatpak apps from the catalog, a wallpaper, a logo and an accent colour. The result is a hybrid live ISO that boots on BIOS and UEFI, Secure Boot included, from a DVD or a USB stick.
- The reusable GitHub workflow, `build.yml`, builds a spec from any repository, boots the ISO in QEMU in five ways and checks it against the spec.
