# Live Poker Mate

Live Poker Mate, LPM, is a web based application created to facilitate the recording of live poker hands.  The appication is designed to be used on a mobile device at the poker table (not while actually in a hand), but desktop access should also feel 'natural.'  Perhaps on a desktop the default page is the dashboard with hand history and analytics rather than the hand/session recording interface.

The user then has access to a history of live hands played so they can better understand and evaluate their play in a live setting.

In the future it may be beneficial to offer a downloadable app so the user can save data locally without an account or internet connection, but this is a secondary consideration.  A web based application seems much quicker to develop and proffer to customers than an app, which would have to be developed for android and ios, or with something like Kotlin Multi-Platform, and offered on app download services such as Google Play.

## User Interface

The main user interface is poker table akin to what you might see on an online poker playing app, with each player at the table having a profile avatar surrounded by basic, essential, information about the player (name, stack size).  The user then plays through a live hand before being prompted to save the hand on our server.  

After the hand has been saved in the Live Poker Mate database, the user's hand history dashboard should be loaded.  The dashboard should include a section listing the most recent hands, a chart graphing results of hands and sessions, and a popup? range table that is perhaps swipeable to view different positions (big blind, cut-off, low-jack, etc.).

## Key Features

### Live Hand & Session Recording / History

The primary purpose of LPM is to record and view hand and session histories / results.  The user should have the option to record a stand-alone hand, or record a live session as it is happening.  During a session recording, a floating action button should be present to add a hand 

### Customizeable Villains

User can select specific villain archetypes (fish, whale, reg, etc.) in seats, or input specific people as villains so they have concrete data about playing history with players the user might encounter regularly during their play.  This will allow the use to more easily analyze and evaluate how specific, common, opponents play.

### Export to Third Party Software

The user will be able to export their recorded live hands to a standardized file format (see hh-specs.handhistory.org) for export into popular poker tracking software such as PokerTracker4, DriveHUD, or Hand2Note, e.g..  This requires 'commandeering' the ohh file format, which is designed to record online poker hand histories, to encapsulate a hand played in person.

REWORD:
In this way, the robust poker analytics ecosystem that already exists becomes available to the user with respect to their live play.

This will likely be done by simply emailing the ohh files to an email address on file, or by providing a download link.