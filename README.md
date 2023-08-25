# b2o
For converting a Boostnote space to Obsidian vault.

I have always been a supporter of [Boostnote](https://boostnote.io/). Unfortunately, very unfortunately indeed, their [last commit on Github](https://github.com/BoostIO/BoostNote.next-local) seem to have been last year. Leading me to think It's been abandoned.

But no matter, I have the latest .AppImage available for it, so I wan't too worried. I'd just keep using that.

Then I recently learnt of [Obsidian](https://obsidian.md/). And after trying it out, all I could think was "OH, my..."

So I was more than halfway sold on the idea of using it instead of Boostnote. Unfortunately, my Boostnote note collection is quite large, weighing in at around ±4000+ notes. So after some searching and investigating some more, I  found that it supports plugins, so has an API, and *best* of all, it is also plain markdown files, with plain attachmets.

So I decided to make it a challenge for myself to code something that I can  do the conversion with. Especially since both programs uses plaintext files...

So this is the result. a Node JS/Javacript command-line script to convert a Boostnote space into an Obsidian vault. Now, I realize that I hardly use all of the features available, both in Boostnotte as well as Obsidian, so I know the script does not convert everything, just what I use. Nevertheless, I wanted to share it.

So here it is, **b2o**, for use by anyone, for expanding by anyone, and to generally just have fun with!

## Install

1. Just clone the reepository:
```
git clone https://github.com/Mirdarthos/b2o.git
```

2. And install all the Node.JS modules:
```
cd b2o && npm i
```

## Usage

Using it is easy, just run it from anywhere:

```
node ~/Documents/Programming\ Projects/b2o/start.js --spaceDirector=<directpry_to_space> --outdir=<output_directory>
```

I think the arguments are rather self-explanatory...

#### I DO NOT TAKE RESPONSIBILITY FOR ANY LOSS OF SLEEP, LIFE, LIMBS, DATA OR ANYTHING ELSE RESULTING FROM THE USE OF THIS. YOU HAVE BEEN WARNED.
