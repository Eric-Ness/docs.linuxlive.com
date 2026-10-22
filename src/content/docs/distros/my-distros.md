---
title: "My distros"
description: "The My distros page on linuxlive.com: signing in, which repositories it shows, each distro's latest build, and what every action does in your GitHub."
---

[linuxlive.com/me/](https://linuxlive.com/me/) lists the distros you have in your own GitHub, with how their latest build went. From here you change a distro, make a new version, rebuild it, move it to a newer linuxlive, put it in the Library, or delete it. Every action works on your GitHub repository; linuxlive.com keeps no copy of your distro.

## Signing in

Choose **Sign in with GitHub**. linuxlive.com asks GitHub only who you are, and keeps nothing but a sign-in cookie. A sign-in lasts up to 30 days. **Sign out** is at the bottom of the page.

To see your repositories, linuxlive.com also needs the **linuxlive-com** GitHub app installed on them. If you made a distro with **Build it in my GitHub**, you installed it then. If not, the page says "You have not installed the linuxlive-com app yet" and offers **Install the app on GitHub**. The app reaches only the repositories you choose when you install it.

## Which distros show

The page looks at the repositories the app can reach, most recently pushed first. It opens the 30 you pushed to most recently. Any of them with a `linuxlive.yaml` at the top of its main branch is a distro and gets a card.

At the bottom, a line says how many repositories the app can reach, and whether it looked at only some of them, for example "Looked at the 30 repositories you pushed to most recently, of 41." If a distro is missing:

- push a change to it, so it is among the 30 most recent, or
- choose **Choose the app's repositories** at the bottom and add its repository to the app.

If none of the repositories holds a spec, the page says "No distros yet" and links to the Workshop. **Make another** at the top opens the Workshop for a new distro.



## A distro's card

Each card shows the distro's logo, name and version, and a line with the repository's name, the base, the desktop, the linuxlive release it builds with, and "rebuilds monthly" when its monthly rebuild is on.

Under that is the latest build on the repository's main branch:

| Status | Meaning |
| --- | --- |
| Not built yet | GitHub has not run a build yet. |
| Building now | A build is running. |
| Built and boot-tested | The latest build passed every check. |
| Build failed | The latest build stopped at a step that failed. |
| Build cancelled | The latest build was stopped before it finished. |

Beside it, a pill says how old the newest good ISO is: "Built 12 days ago". At 45 days or more it turns amber, with a note that the ISO lacks the security fixes since and a nudge to rebuild.

## The actions

The first button depends on the latest build:

- **Get the ISO**: opens the finished run on GitHub. The ISO is under **Artifacts** at the bottom of the run. GitHub keeps it for 7 days; after that, choose **Rebuild now** for a fresh one.
- **Watch the build**: opens the running build on GitHub.
- **See what happened**: opens the failed or cancelled run, where the failed step says why. See [Failed builds](/help/failed-builds/).

The rest are below.

### Edit the spec

**Edit the spec** opens the distro in the Workshop, filled in from your repository. Change what you like. On the last step, **Save** replaces the usual build buttons; it reads "Save version 0.3 to you/my-distro", with the next version number already filled in. Change the number on the Look step if you want another.

On GitHub, Save makes one commit on top of the version you opened. The commit message lists what changed, such as the apps, the base or the art. The push starts a build, and the ISO of the new version follows in 20 to 40 minutes.

Things to know:

- If the repository changed on GitHub after you opened it in the Workshop, nothing is saved: "...changed on GitHub after you opened it here, so nothing was saved. Open it from My distros again to see the change, then make yours." Your edit on GitHub is never overwritten.
- Comments in your `linuxlive.yaml` are not kept when you save from the Workshop.
- If the spec has something the Workshop cannot hold, the Workshop lists it and turns saving off. You can still edit `linuxlive.yaml` on GitHub.
- Files the old spec named and the new one does not, such as a wallpaper you replaced with one of another type, are removed in the same commit.

### New version

**More**, then **New version**, sets a new version number without opening the Workshop. The box suggests the next number. Choose **Save and rebuild**.

On GitHub, this commits a one-line change to `linuxlive.yaml` with the message "Version 0.3 (was 0.2)", and the push builds the distro again. Versions are letters, digits and `. + ~ -`, at most 20 characters, for example `0.2`, `1.0` or `2026.11`.

### Rebuild now

**Rebuild now** builds the unchanged spec again, so the ISO gets the newest packages. On GitHub, it starts the repository's build workflow on its main branch, the same as **Actions**, **build**, **Run workflow**. It takes 20 to 40 minutes.

GitHub pauses a monthly rebuild after 60 days without a commit. Rebuild now turns the workflow back on first and tells you: "GitHub had paused this workflow; it is on again". A workflow you turned off yourself stays off: "The build workflow in you/my-distro is turned off. Turn it on in the repository's Actions tab first."

The button is hidden while a build is running.

### Update to a newer linuxlive

When a newer linuxlive release is out than the one your distro builds with, the card shows "linuxlive v0.9.1 is out; this distro builds with v0.8.1." and a button, **Update to linuxlive v0.9.1**. If the distro's monthly rebuild is off, the button reads **Turn on monthly rebuilds** instead.

On GitHub, either one opens a pull request in your repository that changes `.github/workflows/build.yml`. It moves the release the workflow builds with, and turns on the monthly rebuild if it is missing. Nothing changes until you merge it; merging builds and boot-tests the distro with the new release. [Rebuilds and updates](/distros/rebuilds-and-updates/) shows exactly what the pull request changes.

### Submit to the Library

Once the latest build has passed, **Submit to the Library** opens a short form in the card. Fill it in and choose **Open the pull request**. On GitHub, this opens a pull request adding your distro to the [Library repository](https://github.com/Eric-Ness/linuxlive-library), from a fork of it that linuxlive.com makes in your account. The Library's check then builds it, and a maintainer reviews it before it is published.

After that the card shows where it stands: **Waiting for review** with the pull request's number, then "✓ In the Library (0.2)". When your repository has a newer version than the Library's copy, the button reads **Send 0.3 to the Library**. [The Library](/distros/library/) covers the form, the rules and the review.

### View in the Library

For a distro already in the Library, **View in the Library** opens its Library page.

### Repository on GitHub

**More**, then **Repository on GitHub**, opens the repository.

### Delete

**More**, then **Delete**, deletes the repository on GitHub: its spec, art, scripts and every build. It cannot be undone. Type the repository's name to turn on **Delete forever**.

If the distro is in the Library as yours, a pull request removing it from the Library opens first. Merging that pull request also deletes its ISOs from the Library's downloads. The page tells you: "The Library removal is waiting to be merged". linuxlive.com deletes only repositories that hold a `linuxlive.yaml`.

## Built for you

Builds from **Build it for me** are listed below your distros, under "Built for you", newest first. Each shows its state ("Waiting to start", "Building now", "Ready to download", "Build failed"), when it was built, and how many days are left before it is deleted. **Get the ISO** or **Watch it** opens its [build page](/distros/build-page/).

These builds are not repositories, so none of the actions above apply to them.

## When GitHub says no

Some actions need a permission the linuxlive-com app may not have yet. The message names it, for example:

> Starting a build needs the linuxlive-com app's "Actions: read and write" permission: accept it at github.com/settings/installations, then sign out and in on linuxlive.com.

| Action | Permission the app needs |
| --- | --- |
| Rebuild now | Actions: read and write |
| Update to linuxlive, Turn on monthly rebuilds | Workflows: read and write |
| Submit to the Library | Pull requests: read and write |
| Delete | Administration: read and write |

Accept the new permission on GitHub's installations page, then sign out and back in on linuxlive.com. You can always do the same thing on GitHub yourself instead.
