---
title: The dock
description: Pinning your apps to the dock or panel with settings.dock, how each desktop gets the list, and what CI checks.
---

`settings.dock` pins your distro's apps to the dock or panel, in the order you list them. Since pipeline v0.9.0. In the Workshop it is **Pin to the dock** on the Settings step; see [Settings](/workshop/settings/).

```yaml
apps:
  - firefox
  - vlc
flathub:
  - org.gnome.Chess
settings:
  dock:
    - firefox
    - org.gnome.Chess
    - vlc
```

## The rules

- **Up to 12 apps**, each once.
- **Only apps the distro has.** Each entry is an id from `apps` (such as `firefox`) or a Flathub ID from `flathub` (such as `org.gnome.Chess`). Anything else is refused: `settings/dock/1: 'gimp' is not one of the spec's apps or flathub apps; only apps the distro has can be pinned`.
- **In order.** The dock shows them in the order listed.
- **After the file manager.** The desktop's file manager always comes first, then your list.
- **Without `dock`**, each desktop keeps its own default dock or panel.

| Desktop | File manager first on the dock |
| --- | --- |
| GNOME | Files (`org.gnome.Nautilus.desktop`) |
| KDE Plasma | Dolphin (`org.kde.dolphin.desktop`) |
| Cinnamon | Nemo (`nemo.desktop`) |

So the example above gives, on GNOME: Files, Firefox, Chess, VLC.

## How each desktop gets it

Each app is pinned by its desktop file, named after its Flathub ID: `firefox` becomes `org.mozilla.firefox.desktop`.

| Desktop | How the list is set | Who gets it |
| --- | --- | --- |
| GNOME, and Ubuntu's dock | The default of GNOME's `favorite-apps` setting, which GNOME's dash and Ubuntu's dock both show. On Ubuntu it is also written for Ubuntu's own session, so Ubuntu's defaults do not win. | Every user who has not changed their favourites |
| Cinnamon | The default pinned apps of the panel's grouped window list, set while the image is built | Each new user |
| KDE Plasma | The panel's task manager launchers, written when each user first logs in | Each user, once, at their first login |

These are starting points: people can still pin and unpin apps themselves, and what they change is kept. On KDE the list is written once per user, so a user who rearranges their panel keeps their own.

The live session's user starts fresh at every boot, so the live desktop starts with your list each time, unless the distro [saves changes to the USB stick](/spec/reference/#persistence) and the user changed it.



## What CI checks

A build in GitHub reads the dock of the logged-in user, on the live desktop and on the installed disk, and checks that it holds exactly the file manager followed by your list, in order. A missing app, an extra one or the wrong order fails the Verify step with a line like this one, for a spec that pins only Firefox on GNOME:

```text
FAIL session: the dock pins 'org.gnome.Nautilus.desktop org.mozilla.firefox.desktop' (found ...)
```

Kiosk distros have no desktop, so their dock is not checked.

The examples cover every desktop and base the feature applies to: `settings-ubuntu.yaml` (GNOME on Ubuntu), `settings-fedora.yaml` (KDE Plasma on Fedora, with a Flathub app first), `settings-cinnamon.yaml` (Cinnamon on Fedora) and `lawndarts-ubuntu.yaml` (Cinnamon on Ubuntu). See [Examples](/spec/examples/).
