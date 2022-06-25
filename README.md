# BellaInterpreter
This project uses nodejs to interpret the language Bella. Please note that I did not write said language, only the interpreter.

## Installation instruction

If you do not have npm or node installed please use a search engine to find the current instructions to do so. 

Please be sure to do an `npm install` once you have cloned a fresh repository.

If it is not working try running the command `npm install ohm.js` and then `npm install` again.

If that doesn't work then . . . I'm not sure what to tell yah  (´◕ ᵔ ◕`✿)*ᶜʳᶦᵉˢ*

## File structure
So everything is pretty much located within the `src` folder. But below shall be a more detailed account of what is in each file and how you can use it to interpret your own Bella scripts into
legible code! (❦ ᴗ ❦ ✿)

* `Bella.ohm`

    * This is where the Ohm grammar for the language Bella lives

        * (Once again I did not write this)

* `BellaInterpreter.js`
    * This is where the interpreter for Bella lives
        * I wrote this, however it is loosely based on [Dr. Ray Toal's Astro Interpreter](`https://cs.lmu.edu/~ray/notes/introohm/`)
    * To run the interpreter on your own code go into the `src` folder on the command line and
        type `node BellaInterpreter.js [file_name]`
        * Note: There is already a file called `example.b` that includes a sample Bella program commented out. Pick and choose which lines you want to run and see their expected output. 
        Or you can simply explore and write your own samples in the same file, or a new one. The choice is yours! (◠‿◠✿)
* `example.b`
    * As mentioned in the above note, this is where the commented out ~~tester~~ sample code, created as ~~a poor alternative to writing an actual tester because I am lazy~~ an example for new users to get a feel for the language.

## About Bella
I'm too lazy to actually copy and paste this section from [Dr.Ray Toal's website](`https://cs.lmu.edu/~ray/notes/bella/`) so head over there if you want to see everything about the language Bella! (◡‿◡✿)
