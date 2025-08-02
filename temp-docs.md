
Tools

Showcase
Community
Learn GSAP
Docs
Demos
Login/Create Account



Skip to main content
Docs
Learning
v3.13.0

Filter sidebar...
docsHome
Quick Start
Installation

Webflow
Wordpress
YouTube Channel
Demos
Cheatsheet
Fundamentals
GSAP

Tween

Timeline

CSS
Easing

Plugins
What's a plugin?
ScrollTrigger

ScrollSmoother

SplitText

Flip

more plugins
Useful features & tools
Utility Methods

Staggers
Helper functions

React - useGSAP()
llms.txt
Detailed walkthrough

GSAP is "framework agnostic", this means it can be used in React, Webflow, Wordpress, or any other JS/Web frameworks. The core GSAP file and all the plugins are just Javascript files.

This video and the install helper below both cover the most common ways to load the files. Namely via NPM, Yarn, and using a simple <script> tag. Pick your own adventure or check out our install guides in the left submenu for framework or tool specific guidance.

Grab the files
What's in the zip download?
Install Helper
Looking for the bonus plugins?
Thanks to Webflow GSAP is now 100% FREE including ALL of the bonus plugins like SplitText, MorphSVG, and all the others that were exclusively available to Club GSAP members.

Can't find the plugins? Make sure you're on the latest version - 3.13

npm
cdn
yarn
npm install gsap

npm install @gsap/react

Import and Include Plugins
Uncheck All
Plugins
Draggable
DrawSVG
Easel
Flip
GSDevTools
Inertia
MotionPathHelper
MotionPath
MorphSVG
Observer
Physics2D
PhysicsProps
Pixi
ScrambleText
ScrollTrigger
ScrollSmoother
ScrollTo
SplitText
Text
Eases
RoughEase
ExpoScaleEase
SlowMo
CustomEase
CustomBounce
CustomWiggle
React
useGSAP
umd
esm
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { CustomEase } from "gsap/CustomEase";
// CustomBounce requires CustomEase
import { CustomBounce } from "gsap/CustomBounce";
// CustomWiggle requires CustomEase
import { CustomWiggle } from "gsap/CustomWiggle";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
    
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { EaselPlugin } from "gsap/EaselPlugin";
import { Flip } from "gsap/Flip";
import { GSDevTools } from "gsap/GSDevTools";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Observer } from "gsap/Observer";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PhysicsPropsPlugin } from "gsap/PhysicsPropsPlugin";
import { PixiPlugin } from "gsap/PixiPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ScrollSmoother requires ScrollTrigger
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(useGSAP,Draggable,DrawSVGPlugin,EaselPlugin,Flip,GSDevTools,InertiaPlugin,MotionPathHelper,MotionPathPlugin,MorphSVGPlugin,Observer,Physics2DPlugin,PhysicsPropsPlugin,PixiPlugin,ScrambleTextPlugin,ScrollTrigger,ScrollSmoother,ScrollToPlugin,SplitText,TextPlugin,RoughEase,ExpoScaleEase,SlowMo,CustomEase,CustomBounce,CustomWiggle);

Details
What's registerPlugin?
Registering a plugin with the GSAP core ensures that the two work seamlessly together and also prevents tree shaking issues in build tools/bundlers.

There is no harm in registering the same plugin multiple times

Read the docs
FAQs
Do I need to gsap.registerPlugin() each plugin?
Is it bad to register a plugin multiple times?
I'm getting a TypeScript error - what do I do?
How can I load the non-ES modules version of GSAP using a build tool?
Why does my production build fail? (perhaps in webpack, vue-cli or create-react-app)
Can I use an older version of GSAP?
Previous
docsHome
Next
GSAP
Contents
Grab the files
Install Helper
FAQs
GSAP
Core
Docs
All Plugins
Scroll
ScrollTrigger
ScrollSmoother
ScrollTo
SVG
DrawSVG
MorphSVG
MotionPath
MotionPathHelper
UI
Flip
Draggable
Inertia
Observer
Text
SplitText
ScrambleText
Text Replace
Other
Physics2D
PhysicsProps
GSDevTools
Keep in the loop with the GSAP® newsletter.
Email *
Email Address


GSAP
Blog
Showcase
Learn GSAP
GSAP & Webflow
Contact Us
Connect
Forums
Codepen
LinkedIn
Bluesky
GitHub
X
©2025 GSAP - A Webflow Product. All rights reserved.

 Privacy Policy. Terms of Use.
