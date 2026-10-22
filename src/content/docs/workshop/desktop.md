---
title: Desktop
description: The three desktops the Workshop offers, GNOME, KDE Plasma and Cinnamon, and how each handles your branding.
---

The second step asks "Which desktop?". The desktop is what people see and use: the panels, the menu, the file manager and the login screen. All three work on both bases.

## The three desktops

| | GNOME | KDE Plasma | Cinnamon |
| --- | --- | --- | --- |
| The Workshop says | A top bar and a dock. Clean and focused. | A taskbar and start menu. Familiar and configurable. | A classic panel and menu. Easy coming from Windows. |
| File manager | Files | Dolphin | Nemo |
| Accent colour | The nearest of GNOME's nine accent colours | Your exact colour | None: its theme keeps its own colours |
| Your logo shows | On the login screen | As the application launcher button | As the menu button |
| Your wallpaper shows | Desktop and lock screen | Desktop, lock screen and login screen | Desktop, lock screen and login screen |

GNOME is picked when you open the Workshop.

## Which to pick

- **GNOME** suits people who like a tidy screen: one bar at the top and a dock of favourite apps.
- **KDE Plasma** suits people who expect a Windows-style taskbar and like to change things.
- **Cinnamon** suits people coming from Windows who want a plain panel and a start menu. It runs as an X11 session on both bases.

You can change desktop at any time; your apps and art stay. The preview on the right switches layout as soon as you click, and the examples under **Hide from the menu** on the Settings step follow the desktop too.

## What follows from the desktop

- **Accent colour.** The help under the colour swatches on the Look step tells you what your desktop does with your colour. See [Look](/workshop/look/#accent-colour).
- **Pin to the dock.** Pinned apps go after the desktop's file manager: in GNOME's dock, Cinnamon's panel, or KDE Plasma's task manager. See [Settings](/workshop/settings/).

On Fedora, GNOME starts from Fedora Silverblue and KDE Plasma from Fedora Kinoite. Fedora has no Cinnamon Atomic image, so Cinnamon is installed onto the base Atomic image those two are built from.

:::note
The pipeline's CI boot-tests GNOME on Ubuntu, KDE Plasma on Fedora, and Cinnamon on both. GNOME on Fedora and KDE Plasma on Ubuntu build, but are not boot-tested in that CI. See [Known limits](/help/known-limits/).
:::
