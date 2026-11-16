import { NOUR_TITLE } from '../../../data/heroes.js';

/**
 * Heroes — English.
 * Same structure as the Arabic file: 4 short lines per situation
 * (celebrate · encourage · hint · wrong). Kind, simple, non-combat.
 */
export default {
  lubna: {
    name: 'Lubna',
    title: 'Laser & Code Engineer',
    bio: 'Loves lasers and code, and solves any puzzle step by step.',
    lines: {
      celebrate: [
        'Bravo! Your idea ran like clean code.',
        'A beam of understanding! You really get it.',
        'Almost first try! Great job.',
        'Saving this in my notes: you are a genius!',
      ],
      encourage: [
        "Let's test it! Every try teaches us something new.",
        'There are no mistakes here, only new data.',
        "One more small step and you'll get there.",
        "I'm with you. We'll solve it line by line.",
      ],
      hint: [
        'Change one thing at a time, like testing code.',
        'Check the live results. The secret is in the numbers.',
        'Guess first, then test it and see.',
        'If something feels off, press Reset and start again.',
      ],
      wrong: [
        'So close! Adjust one small number and try again.',
        'No worries. Even the best coders try many times.',
        "Not quite yet, but you're on the right track.",
        "Let's check the steps together, nice and calm.",
      ],
    },
  },
  shihab: {
    name: 'Shihab',
    title: 'Speed Racer',
    bio: 'The fastest on the team, crazy about motion and speed.',
    lines: {
      celebrate: [
        'Lightning fast! You finished the challenge.',
        'You crossed the finish line! Great job.',
        'You learn at top speed!',
        "Champion's lap! You're the star of this experiment.",
      ],
      encourage: [
        "Ready? Let's go!",
        'Even the fastest racer started with one step.',
        'Take a breath and keep that energy.',
        "You're almost at the finish line!",
      ],
      hint: [
        'Watch how the speed changes every second.',
        'Try the smallest and the biggest values, then compare.',
        'Play, pause, and see what changed.',
        'Look at the arrow. Its direction tells you a lot.',
      ],
      wrong: [
        'Quick pit stop! Try again calmly.',
        'No problem. Every race has another lap.',
        'Really close. Tweak one small thing.',
        "It's okay. Mistakes show us the right way.",
      ],
    },
  },
  nour: {
    name: 'Nour',
    title: NOUR_TITLE.en,
    bio: 'The heart of Team Misbar, cheering on every new explorer.',
    lines: {
      celebrate: [
        "Bravo! That's real Misbar Hero work.",
        'A new star for you! Awesome.',
        'You got the idea exactly right!',
        "I'm so proud of you!",
      ],
      encourage: [
        "Come on, hero. I'm right here with you.",
        'This experiment is waiting for you to discover it.',
        "Step by step, we'll get there together.",
        'A good question is where every discovery starts.',
      ],
      hint: [
        'Move just one control and see the difference.',
        'The live results are talking to you. Read them closely.',
        'Remember the science rule and use it.',
        'Before you test, guess what will happen.',
      ],
      wrong: [
        'No worries! Try again a different way.',
        'Very close. Adjust one small thing.',
        'Every great scientist made mistakes first.',
        "Let's look at the help together.",
      ],
    },
  },
  suhail: {
    name: 'Suhail',
    title: 'Space Explorer',
    bio: 'Maps the stars and dreams of visiting every planet.',
    lines: {
      celebrate: [
        "New discovery! It's on our space map.",
        'We reached the right orbit! Bravo.',
        'The stars are proud of you today.',
        'Exploration complete!',
      ],
      encourage: [
        'Space is huge, and there is so much to discover.',
        'Every explorer tries many times before finding something.',
        "You're on the right path. Keep going.",
        "Let's explore together!",
      ],
      hint: [
        'Compare before and after. The difference is the discovery.',
        'Change one value and wait a moment to see its effect.',
        'Read the rule in Help. It guides you like a compass.',
        'Read the live results like a spaceship dashboard.',
      ],
      wrong: [
        "We drifted a little. Let's get back on course.",
        'No worries. Every trip needs a small change of course.',
        'Close to the goal! Try a different number.',
        "Take your time. Space isn't going anywhere.",
      ],
    },
  },
  sharara: {
    name: 'Sharara',
    title: 'Energy & Heat Expert',
    bio: 'Knows all about heat and energy, and how matter changes.',
    lines: {
      celebrate: [
        'Your energy is sky high! Challenge done.',
        'The experiment warmed up and worked! Bravo.',
        'A spark of genius! You got it.',
        "You're lighting up the lab today!",
      ],
      encourage: [
        "Power up and let's experiment!",
        'Every try adds to your energy.',
        'You can do more than you think. Keep going.',
        'A little patience and the result will show.',
      ],
      hint: [
        'Raise the heat little by little and watch.',
        "Energy doesn't vanish. It changes form.",
        'Notice the moment when everything changes.',
        'Compare the numbers as you change the settings.',
      ],
      wrong: [
        'Not enough energy yet. Try again.',
        "No worries. Let's cool down and think together.",
        'Almost! Change one small thing.',
        'Mistakes are part of experimenting. Keep going.',
      ],
    },
  },
};
