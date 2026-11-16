// needs human review: English science wording (guides: hints, facts and challenges).
import { formatNumber } from '../../../lib/arabic.js';
import sims from './sims/index.js';

/** Lab (Playground) strings — English. Same shape as ar/lab.js. */
export default {
  workspace: {
    controlsTitle: 'Experiment controls',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    stageLabel: 'Experiment area',
  },
  results: {
    title: 'Live results',
    separator: ', ',
  },
  fraction: {
    spoken: ({ numerator = 0, denominator = 0 }) => `${formatNumber(numerator)} over ${formatNumber(denominator)}`,
  },
  header: {
    back: 'Back to the library',
    help: 'Need help?',
  },
  notFound: {
    eyebrow: 'Experiment lab',
    title: "This experiment doesn't exist",
    message: 'The link may have changed. Go back to the library and pick another experiment.',
  },
  challenge: {
    label: "{name}'s challenge",
    tipLead: "{name}'s tip:",
    completedDetail: 'You finished this challenge and got your star! Keep exploring as much as you like.',
    metDetail: 'You reached the goal! Press the button to get your star.',
    check: 'Check challenge',
    claim: 'Done! (+1 star)',
    done: 'Challenge complete',
  },
  help: {
    title: "{name}'s help",
    close: 'Close help',
    hintTitles: ['The big idea', 'What can you change?', 'The science rule'],
    fact: 'Quick fact',
    gotIt: "Got it, let's try!",
  },
  guides: {
    'motion-acceleration': {
      labTitle: 'Misbar Physics Lab',
      intro: "No worries, hero! Let's find out together, step by step, how a force makes the cart move.",
      // needs human review
      hints: [
        'When you push the cart hard, its speed goes up every second. That rise in speed each second is called “acceleration”.',
        'Turn up the push force and watch the cart speed up faster. Then add more mass and notice it gets heavier and slower. Switch on friction and watch the red arrow that works against the motion.',
        "Newton's second law: acceleration = net force ÷ mass. And net force = push force − friction force.",
      ],
      // needs human review
      fact: "Friction isn't always a bad thing! Without it, car tyres couldn't grip the road and cars couldn't move at all.",
      challenge: {
        prompt: 'Switch on friction and get the cart to the finish line with an acceleration of exactly 3 m/s²!',
        tip: 'With friction on, every kilogram of mass uses up 2 newtons of the push force.',
        retry: 'Almost! Friction must be on, the acceleration must be exactly 3 m/s², and the cart must reach the finish line.',
        success: 'Well done, hero! You got it right: net force ÷ mass = 3 m/s².',
      },
    },

    'lever-balance': {
      labTitle: 'Misbar Physics Lab',
      intro: 'No worries, hero! Let me show you the secret of the lever, and how a light weight can balance a heavy one.',
      // needs human review
      hints: [
        'A lever is a bar that turns around a pivot. Each weight tries to tip the bar toward its side, and this turning effect is called “torque”.',
        'Move a weight farther from the pivot and watch its effect grow, even if its mass is small. Compare the right torque with the left torque in the live results.',
        'Torque = weight × distance from the pivot. The lever balances when the right torque equals the left torque exactly.',
      ],
      // needs human review
      fact: 'Archimedes said: “Give me a pivot and I will lift the Earth!” A long arm multiplies the effect of a force.',
      challenge: {
        prompt: 'Balance the lever with two weights of different masses until it is perfectly level!',
        tip: 'Move the heavy weight closer to the pivot and the light one farther away.',
        retry: 'Not yet! The two weights need different masses, the two torques must be equal, and the lever must settle and stay level.',
        success: 'Genius! You balanced a heavy weight and a light weight with exactly the same torque.',
      },
    },

    'planet-orbits': {
      labTitle: 'Misbar Space Lab',
      intro: "No worries, hero! Let's fly into space together and find out what keeps a planet going around its star.",
      // needs human review
      hints: [
        'The star pulls the planet toward it with gravity, while the planet moves fast to the side. So instead of falling into the star, it keeps going around it in an orbit.',
        'Make the star heavier and watch the planet go around faster. Move the orbit farther out and notice the year gets longer and the pull gets weaker.',
        "Kepler's third law: the orbit time squared equals the orbit radius cubed ÷ the star's mass. Gravity gets weaker with the square of the distance.",
      ],
      // needs human review
      fact: 'Earth travels around the Sun at about 30 kilometres per second, more than 100 times faster than a plane!',
      challenge: {
        prompt: "Make the planet finish one full orbit in one year (about 365 days) around a star whose mass is not like the Sun's!",
        tip: 'A heavier star needs a farther orbit to keep the year the same.',
        retry: "Not yet! Change the star's mass from 1.0, adjust the orbit until the orbit time is close to 365 days, then wait for the planet to finish a full orbit.",
        success: "Excellent, astronomer! You found an orbit with a year as long as Earth's around a different star.",
      },
    },

    'fractions-area': {
      labTitle: 'Misbar Maths Lab',
      intro: "No worries, hero! Let's split shapes together and see fractions with our own eyes.",
      // needs human review
      hints: [
        'A fraction tells us how many equal parts we split the shape into (the denominator), and how many of those parts we took (the numerator).',
        'Change the denominator and watch the shape split into smaller parts. Then change the numerator and notice how the coloured area and the percentage change.',
        'Percentage = (numerator ÷ denominator) × 100. If we divide the numerator and the denominator by the same number, we reach the simplest form without changing the value.',
      ],
      // needs human review
      fact: '“Two out of four”, “three out of six” and 50% are all exactly one half: different ways of showing the same area!',
      challenge: {
        prompt: "Make a fraction worth exactly 75%, but its denominator can't be 4!",
        tip: 'Try multiplying the numerator and the denominator by the same number.',
        retry: 'Not yet! The percentage must be exactly 75%, and the denominator can be any number except 4.',
        success: 'Clever! You found a fraction equal to three quarters.',
      },
    },

    'light-refraction': {
      labTitle: 'Misbar Light Lab',
      intro: "No worries, hero! Let's follow a ray of light and see what it does when it meets a new material.",
      // needs human review
      hints: [
        'When light reaches the border between two materials, part of it bounces back (reflection) and part passes through and changes direction (refraction), because its speed changes.',
        'Change the angle of incidence and compare it with the angle of reflection. Then send the light from glass into air at a big angle and see what happens.',
        "Angle of incidence = angle of reflection. Snell's law: first refractive index × sine of the incidence angle = second refractive index × sine of the refraction angle.",
      ],
      // needs human review
      fact: 'Fibre-optic internet cables use total internal reflection to carry light over very long distances without letting it escape.',
      challenge: {
        prompt: 'Make all of the light bounce back without passing into the second material: total internal reflection!',
        tip: 'The light has to travel from a denser material into a less dense one.',
        retry: 'Not yet! Pick a first material that is denser than the second (like glass to air), and make the angle of incidence bigger than the critical angle.',
        success: "Amazing! That's the same secret that makes optical fibres work.",
      },
    },

    'matter-states': {
      labTitle: 'Misbar Heat Lab',
      intro: "No worries, hero! Let's heat things up and cool them down together, and see what the particles do inside matter.",
      // needs human review
      hints: [
        'All matter is made of tiny particles that move all the time. The hotter it gets, the faster the particles move and the farther apart they spread.',
        'Heat the ice up to 0 °C and watch: the temperature stops rising until all of it melts! Then keep going to 100 °C and watch it boil.',
        'Water melts at 0 °C and boils at 100 °C. While it changes from one state to another, the heat goes into breaking the bonds between particles, so the temperature stays the same.',
      ],
      // needs human review
      fact: 'Water vapour particles at 100 °C zoom around at about 700 metres per second, roughly twice the speed of sound!',
      challenge: {
        prompt: 'Heat the ice until it turns into steam (gas), then cool it until it becomes solid ice again!',
        tip: 'Use the heat and cool buttons or drag the temperature slider, and keep the experiment running.',
        retry: 'Not yet! The matter must turn completely into gas first, and then turn completely back into a solid.',
        success: 'Brilliant! You made a full cycle: solid → liquid → gas → liquid → solid.',
      },
    },
  },
  sims,
};
