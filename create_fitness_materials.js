/*
  Create Fitness & Exercise Reading Materials
  Run: node create_fitness_materials.js
*/

import { ReadingMaterial, sequelize } from './models/index.js';

// Assuming counselor account exists with ID 2 (from previous setup)
const COUNSELOR_ID = 2;

const fitnessContents = [
  {
    title: "Exercise Tips for Stress Relief",
    slug: "exercise-stress-relief",
    category: "Fitness",
    excerpt: "Discover how regular physical activity can significantly reduce stress levels and improve your mental health. Learn practical exercises you can do anywhere.",
    content: `# Exercise Tips for Stress Relief

## Why Exercise Matters for Mental Health

Physical activity is one of the most effective ways to manage stress and anxiety. When you exercise, your body releases endorphins - natural chemicals that improve mood and reduce pain perception.

## Types of Beneficial Exercises

### 1. Light Cardio (Walking, Jogging)
- **Benefits**: Improves mood, increases energy, clears mind
- **Duration**: 20-30 minutes
- **Frequency**: 3-5 times per week
- **Tips**: 
  - Walk outdoors in nature for added benefit
  - Listen to calming music while exercising
  - Start slow if you're a beginner

### 2. Strength Training
- **Benefits**: Boosts confidence, releases tension, improves sleep
- **Duration**: 30-45 minutes
- **Frequency**: 2-3 times per week
- **Tips**:
  - Focus on controlled movements
  - Don't worry about heavy weights initially
  - Rest between sets (1-2 minutes)

### 3. Flexibility Training (Yoga, Stretching)
- **Benefits**: Releases muscle tension, promotes relaxation, improves balance
- **Duration**: 15-30 minutes
- **Frequency**: Daily
- **Tips**:
  - Practice gentle stretches
  - Focus on breathing during stretches
  - Hold each stretch for 20-30 seconds

## Quick 10-Minute Stress-Busting Workout

1. **Warm-up (2 min)**: Light jogging or jumping jacks
2. **Main workout (6 min)**:
   - 20 squats
   - 15 push-ups
   - 30-second plank
   - 20 lunges (10 each leg)
   - Repeat 2-3 times
3. **Cool-down (2 min)**: Gentle stretching

## Exercise During Work/Study

- **Desk stretches**: Every 30 minutes, stretch your neck, shoulders, and back
- **Walk breaks**: Take a 5-minute walk every hour
- **Stairs**: Use stairs instead of elevators
- **Standing**: Alternate between sitting and standing

## Best Times to Exercise

- **Morning**: Great for boosting mood throughout the day
- **Afternoon**: Helps break up stress during the day
- **Evening**: Can improve sleep quality (but not too close to bedtime)

## Tips for Getting Started

1. **Start small**: Even 10 minutes of walking helps
2. **Find what you enjoy**: Exercise works best when you like it
3. **Set realistic goals**: Aim for consistency, not perfection
4. **Track progress**: Keep a simple log of your activities
5. **Be patient**: It takes 3-4 weeks to notice mood changes

## Important Reminders

- Listen to your body
- Drink plenty of water
- Don't compare yourself to others
- Celebrate small victories
- Exercise for health, not punishment

Remember: The best exercise is the one you'll actually do. Start where you are, use what you have, and do what you can.`
  },
  {
    title: "Yoga & Mindfulness for Daily Wellness",
    slug: "yoga-mindfulness-wellness",
    category: "Fitness",
    excerpt: "Learn how to incorporate yoga and mindfulness practices into your daily routine to reduce anxiety, improve focus, and find inner peace.",
    content: `# Yoga & Mindfulness for Daily Wellness

## Understanding Yoga and Mindfulness

Yoga combines physical postures, breathing techniques, and meditation. It's a holistic practice that addresses both body and mind, perfect for stress relief and mental wellness.

Mindfulness is the practice of being fully present in the moment without judgment. When combined with yoga, it creates powerful mental health benefits.

## Benefits of Yoga Practice

- **Mental**: Reduces anxiety, improves focus, enhances emotional regulation
- **Physical**: Increases flexibility, builds strength, improves posture
- **Emotional**: Promotes self-compassion, reduces negative thoughts
- **Sleep**: Improves sleep quality and duration

## Basic Yoga Poses for Beginners

### Mountain Pose (Tadasana)
- Stand with feet together, arms at sides
- Press all four corners of your feet down
- Engage your thighs and core
- Hold for 1 minute
- **Benefits**: Improves posture, grounds energy

### Child's Pose (Balasana)
- Kneel on a mat, bring hands forward
- Rest forehead on the mat
- Breathe deeply for 1-2 minutes
- **Benefits**: Calms mind, releases tension

### Cat-Cow Pose (Marjaryasana-Bitilasana)
- Get on hands and knees
- Alternate between arching back (cow) and rounding spine (cat)
- Move with your breath
- **Benefits**: Releases spinal tension, synchronizes breath and movement

### Downward-Facing Dog (Adho Mukha Svanasana)
- Form an inverted V-shape with your body
- Head between hands, looking down
- Hold for 5-10 breaths
- **Benefits**: Stretches hamstrings, shoulders, calves

### Warrior I (Virabhadrasana I)
- Step one foot back, bend front knee
- Raise arms overhead
- Hold for 5-8 breaths, then switch sides
- **Benefits**: Builds strength, confidence, focus

## Simple 15-Minute Yoga Routine

1. **Opening (2 min)**: Seated meditation, focusing on breath
2. **Warm-up (2 min)**: Cat-cow poses, neck rolls
3. **Standing poses (6 min)**: Mountain, Warrior I, Warrior II, Triangle
4. **Floor poses (3 min)**: Child's pose, seated forward bend
5. **Closing (2 min)**: Savasana (corpse pose) for complete relaxation

## Mindfulness Meditation Techniques

### Body Scan Meditation
- Lie down comfortably
- Focus attention on each body part from toes to head
- Notice sensations without judgment
- Duration: 10-20 minutes

### Breath Awareness
- Sit comfortably
- Notice your natural breathing
- Count breaths: inhale (1), exhale (2)
- When mind wanders, gently return to counting
- Duration: 5-10 minutes

### Loving-Kindness Meditation
- Sit comfortably
- Silently repeat: "May I be happy, may I be healthy, may I be safe, may I be peaceful"
- Extend these wishes to others
- Duration: 10-15 minutes

## Building a Daily Yoga Practice

### Week 1-2: Foundation
- 10-15 minutes daily
- Focus on basic poses
- Don't worry about perfection

### Week 3-4: Growth
- 20-30 minutes daily
- Add more complex poses
- Connect poses with breath

### Week 5+: Consistency
- Maintain 30+ minutes daily
- Explore different yoga styles
- Deepen your practice

## Tips for Success

1. **Practice in the morning**: Sets positive tone for the day
2. **Find a quiet space**: Minimize distractions
3. **Use props**: Blocks, straps, and blankets help alignment
4. **Listen to your body**: Never push into pain
5. **Stay consistent**: 3-4 times weekly is more beneficial than sporadic practice
6. **Be patient**: Progress takes time
7. **Consider a class**: Guidance from instructor can be valuable

## Mindfulness in Daily Life

Beyond formal practice, bring mindfulness to:
- **Eating**: Eat slowly, noticing flavors and textures
- **Walking**: Feel your feet on the ground, notice surroundings
- **Working**: Take mindful breaks, focus on one task at a time
- **Conversations**: Listen fully without planning your response

## Common Beginner Mistakes to Avoid

- Comparing yourself to others
- Pushing too hard too fast
- Ignoring body signals
- Practicing right after meals
- Skipping warm-up and cool-down

## Resources for Continued Learning

- Online yoga video platforms
- Local yoga studios
- Meditation apps
- Books on yoga philosophy
- Yoga communities and groups

Remember: Yoga and mindfulness are journeys, not destinations. Be kind to yourself as you explore these transformative practices.`
  },
  {
    title: "Walking Meditation: Movement for Mental Clarity",
    slug: "walking-meditation",
    category: "Fitness",
    excerpt: "Explore the powerful practice of walking meditation to calm your mind, reduce stress, and improve mental clarity while enjoying outdoor movement.",
    content: `# Walking Meditation: Movement for Mental Clarity

## What is Walking Meditation?

Walking meditation is a mindfulness practice that combines gentle movement with focused attention. Unlike traditional sitting meditation, it keeps your body engaged while calming your mind.

It's perfect for:
- People who find sitting meditation difficult
- Those with restless energy
- Individuals who enjoy outdoor activity
- Anyone looking to reduce stress during daily routines

## Benefits of Walking Meditation

**Mental Health Benefits**:
- Reduces anxiety and depression
- Improves focus and concentration
- Enhances emotional regulation
- Promotes sense of calm and peace

**Physical Benefits**:
- Low-impact cardiovascular exercise
- Improves balance and coordination
- Gentle on joints
- Builds endurance gradually

**Emotional Benefits**:
- Increases self-awareness
- Boosts confidence
- Improves mood
- Enhances sense of connection to nature

## Getting Started: Basic Steps

### Preparation
1. Choose a safe, quiet location (park, trail, or peaceful street)
2. Wear comfortable shoes
3. Plan 10-30 minutes
4. Leave phone on silent
5. Dress for the weather

### The Practice (5 Steps)

#### Step 1: Set Your Intention (1-2 min)
- Stop and stand still
- Take 5-10 deep breaths
- Set an intention: "I walk for peace" or "I walk to calm my mind"
- Notice how your body feels

#### Step 2: Focus on Sensations (2-3 min)
- Begin walking at a slow, natural pace
- Feel your feet touching the ground with each step
- Notice the movement of your legs
- Become aware of your arms swinging gently
- Pay attention to the contact point where feet meet earth

#### Step 3: Expand Your Awareness (5-15 min)
- Continue walking mindfully
- Broaden focus to include:
  - Sounds around you (birds, wind, distant traffic)
  - Sights (colors, movement, light and shadow)
  - Smells (flowers, trees, fresh air)
  - Physical sensations (air on your skin, temperature)

#### Step 4: Return to Breath (2-3 min)
- If mind wanders, redirect to breath
- Feel air entering and leaving your nose
- Connect breath to movement: 2 steps per inhale, 2 steps per exhale (or your natural rhythm)

#### Step 5: Closing (1-2 min)
- Slow your pace gradually
- Return to your starting point
- Stand still and take several deep breaths
- Notice how you feel

## Walking Meditation Techniques

### Technique 1: Slow Walking
- Walk very slowly (half your normal speed)
- Focuses attention on each step
- Perfect for beginners
- Duration: 5-10 minutes

### Technique 2: Nature Awareness
- Normal walking pace
- Focus on natural surroundings
- Great for outdoor practice
- Duration: 15-30 minutes

### Technique 3: Counting Steps
- Walk at comfortable pace
- Count: "One, two, three, four, five" with each step
- Restart at 5 if mind wanders
- Duration: 10-20 minutes

### Technique 4: Labeling Sensations
- Walk and notice sensations
- Silently label what you notice: "seeing," "hearing," "feeling"
- This anchors attention
- Duration: 15-30 minutes

### Technique 5: Loving-Kindness Walking
- Walk while silently sending loving thoughts
- "May I be happy, may others be happy"
- Extends compassion with each step
- Duration: 15-20 minutes

## Daily Walking Meditation Routine

### 20-Minute Complete Practice
1. **Warm-up (2 min)**: Find location, settle mind
2. **Slow walking (5 min)**: Focus on foot sensations
3. **Normal pace (8 min)**: Expand awareness to surroundings
4. **Breath focus (3 min)**: Return to breath
5. **Cool-down (2 min)**: Gradual closing, gratitude

## Choosing Your Walking Meditation Location

### Ideal Locations
- **Parks**: Natural beauty, quiet paths
- **Trails**: Peaceful, immersive nature
- **Quiet streets**: Urban option, still accessible
- **Beach/Waterfront**: Calming water element
- **Neighborhood**: Accessible, known route

### Tips for Location
- Choose a loop so you don't need to decide directions
- Pick places with minimal traffic
- Avoid overly crowded areas
- Consider varying locations weekly
- Walk during calm hours if possible

## Walking Meditation for Common Situations

### Stress at Work
- 5-10 minute walking meditation during lunch
- Provides mental reset
- Improves afternoon productivity

### Before Sleep
- 10-15 minute slow walk in evening
- Calms nervous system
- Improves sleep quality
- Do not use phone during walk

### Anxiety Management
- 20-30 minute walk when anxious
- Physical movement helps process stress
- Nature exposure reduces anxiety
- Practice regularly, not just during crises

### Daily Commute
- Transform commute into meditative practice
- If driving: focus on traffic mindfully (not meditation)
- If walking/transit: perfect opportunity for practice

## Tips for Success

1. **Start small**: 5-10 minutes is enough initially
2. **Be consistent**: Practice 4-5 times weekly for benefits
3. **Don't judge**: Wandering mind is normal, gently refocus
4. **Vary pace**: Mix slow and normal pace walks
5. **Seasonal awareness**: Enjoy different weather
6. **Invite others**: Walking partner can share experience
7. **Use prompts**: Set phone reminders for walking time
8. **Journal after**: Note observations and how you felt

## Common Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Mind wanders constantly | Normal! Gently return focus, try counting steps |
| Feel self-conscious | Walk during quiet times, find private locations |
| Uncomfortable physically | Walk slower, shorter duration, better shoes |
| Too noisy/distracting | Choose quieter location, try early morning |
| Difficult to focus | Use a technique (counting, labeling) to anchor attention |

## Integrating Walking Meditation into Life

- **Morning**: Start day with clarity and focus
- **Midday**: Reset energy and reduce stress
- **Evening**: Transition from work to personal time
- **Weekends**: Longer walks in nature for deeper practice

## Advanced Practice

Once comfortable with basics (2-3 weeks):
- Extend duration to 30-60 minutes
- Practice without specific technique
- Notice subtle sensations more deeply
- Combine with gratitude practice
- Explore walking in different environments

## Important Reminders

- Safety first: Be aware of surroundings, avoid hazards
- This is not exercise rushed: meditation over speed
- Honor your pace: This is for your peace, not performance
- Every walk is perfect: No "good" or "bad" walking meditation
- Consistency matters: Regular practice brings deeper benefits

Walking meditation offers a simple, accessible way to calm your mind while honoring your body's need for movement. Start today, even with just 10 minutes, and experience the transformative power of mindful walking.`
  },
  {
    title: "HIIT Training: Quick Workouts for Stress Relief",
    slug: "hiit-training-stress",
    category: "Fitness",
    excerpt: "Discover how High-Intensity Interval Training can boost your mood, reduce stress, and improve fitness in just 10-20 minutes a day.",
    content: `# HIIT Training: Quick Workouts for Stress Relief

## Understanding HIIT

High-Intensity Interval Training (HIIT) alternates between intense exercise and recovery periods. It's efficient, effective, and perfect for busy schedules and mental health.

## Why HIIT for Mental Wellness?

**Stress Relief Through HIIT**:
- Rapid endorphin release for instant mood boost
- Physical exertion processes stress hormones
- Quick workouts fit easily into busy schedules
- Sense of accomplishment reduces anxiety
- Variety keeps mind engaged and focused

**HIIT Benefits**:
- Improves cardiovascular health
- Boosts metabolism
- Builds strength and endurance
- Reduces anxiety and depression
- Improves sleep quality
- Flexible and adaptable to any fitness level

## The HIIT Concept

**Basic Formula**: 
- 30 seconds maximum intensity exercise
- 15-30 seconds recovery
- 8-12 rounds or 15-20 minutes total

You can achieve results anywhere with no equipment!

## Essential HIIT Exercises

### 1. Burpees
- Start standing
- Drop to plank position
- Do a push-up
- Jump feet back to standing
- Jump up with arms raised
- **Intensity**: Maximum
- **Duration**: 30 seconds
- **Recovery**: 20 seconds

### 2. Jump Squats
- Stand with feet shoulder-width apart
- Squat down
- Explode upward with jump
- Land softly and repeat
- **Intensity**: High
- **Duration**: 30 seconds
- **Recovery**: 15 seconds

### 3. High Knees
- Run in place, lifting knees to waist height
- Move arms as if running
- Keep pace rapid
- **Intensity**: High
- **Duration**: 30 seconds
- **Recovery**: 20 seconds

### 4. Mountain Climbers
- Start in plank position
- Bring knees toward chest alternately
- Move quickly as if climbing a mountain
- **Intensity**: High
- **Duration**: 30 seconds
- **Recovery**: 20 seconds

### 5. Jump Lunges
- Lunge forward with right leg
- Jump and switch legs
- Land in lunge with left leg forward
- **Intensity**: High
- **Duration**: 30 seconds
- **Recovery**: 20 seconds

### 6. Plank Jacks
- Start in plank position
- Jump feet apart and together
- Keep body straight
- **Intensity**: Moderate-High
- **Duration**: 30 seconds
- **Recovery**: 20 seconds

## HIIT Workouts for Different Fitness Levels

### BEGINNER HIIT (10-15 minutes)
**Warm-up (2 min)**: Light jogging, arm circles
**Workout**:
1. Jumping jacks (30 sec intensity, 30 sec recovery)
2. Squats (30 sec, 30 sec)
3. Push-ups (30 sec, 30 sec)
4. High knees (30 sec, 30 sec)
5. Rest (1 min)
6. Repeat 2 times
**Cool-down (2 min)**: Stretching

### INTERMEDIATE HIIT (15-20 minutes)
**Warm-up (2 min)**: Dynamic stretching, light cardio
**Workout** (30 sec intensity, 20 sec recovery):
1. Burpees
2. Jump squats
3. Mountain climbers
4. Jump lunges
5. Plank hold
6. Repeat 2-3 times
**Cool-down (2 min)**: Static stretching

### ADVANCED HIIT (20-25 minutes)
**Warm-up (2 min)**: Intense cardio warm-up
**Workout** (40 sec intensity, 15 sec recovery):
1. Burpee jump-ups
2. Double-leg jump squats
3. Speed mountain climbers
4. Jump lunges (alternating)
5. Plank jacks with push-up
6. High knees sprints
7. Repeat 3-4 times
**Cool-down (3 min)**: Stretching and breathing

## Low-Impact HIIT Alternatives

Perfect if you have joint concerns:
- Replace jumps with fast-paced marching
- Do step-back lunges instead of jump lunges
- Step burpees instead of jump burpees
- Fast walking instead of sprinting
- Still gets heart rate up, easier on joints

## HIIT Schedule for Stress Management

### Weekly Plan
- **Monday**: 15-min HIIT session
- **Wednesday**: 10-min quick HIIT
- **Friday**: 20-min HIIT session
- **Weekend**: Optional light activity or yoga

**Important**: Rest days are crucial for recovery and benefits!

## Quick 10-Minute HIIT Routine

Perfect for stressful days:
1. **Warm-up (1 min)**: Jumping jacks, arm circles
2. **Rounds (8 min)**: 
   - 30 seconds: Burpees
   - 20 seconds: Recovery walk
   - 30 seconds: Jump squats
   - 20 seconds: Recovery walk
   - 30 seconds: Mountain climbers
   - 20 seconds: Recovery walk
   - Repeat 1-2 more times
3. **Cool-down (1 min)**: Deep breathing, stretching

## HIIT Mistakes to Avoid

1. **Going too hard too fast**: Build intensity gradually
2. **Not resting adequately**: Recovery is when you adapt
3. **Ignoring form**: Quality over speed prevents injury
4. **Overtraining**: 2-3 HIIT sessions weekly is optimal
5. **Not stopping when in pain**: Discomfort is normal, pain is not
6. **Inconsistent breathing**: Breathe throughout, don't hold breath

## Tracking Your Progress

**Metrics to Monitor**:
- Rounds completed
- Exercises finished with good form
- How you feel mentally afterward
- Energy level throughout day
- Sleep quality that night
- Mood improvement

Keep simple notes on these to see patterns and improvements.

## Safety Considerations

**Before Starting HIIT**:
- Consult doctor if you have health concerns
- Start at appropriate fitness level
- Invest in good shoes
- Warm up properly always
- Stay hydrated
- Stop if experiencing sharp pain

**During Exercise**:
- Listen to your body
- Modify movements as needed
- Maintain proper form over speed
- Breathe continuously
- Don't compare to others

## Why HIIT Works for Stress

1. **Immediate endorphin rush**: Natural mood boost
2. **Physical outlet**: Process stress through body
3. **Mental focus**: Intensity requires full attention
4. **Quick results**: 15 min gives real benefits
5. **Empowerment**: Sense of accomplishment
6. **Better sleep**: Improved sleep after HIIT
7. **Routine**: Consistency builds confidence

## Making HIIT Enjoyable

- **Music**: Create high-energy playlist to match intensity
- **Variety**: Change exercises weekly to stay engaged
- **Environment**: Outdoor or favorite corner at home
- **Accountability**: Workout buddy or class
- **Progress**: Track improvements and celebrate wins
- **Flexibility**: Mix routines to prevent boredom

## Starting Your HIIT Journey

### Week 1-2
- Beginner level 2-3 times weekly
- Focus on learning proper form
- don't worry about speed

### Week 3-4
- Increase to 3-4 sessions weekly
- Can do longer durations (15 min)
- Start increasing intensity slightly

### Week 5+
- Graduated to intermediate level
- Mix beginner and intermediate
- Maintain 3 sessions weekly minimum

## Combining HIIT with Other Practices

**HIIT + Meditation**: Do 5-min meditation after workout to enhance calm
**HIIT + Yoga**: Mix HIIT days with yoga days for balance
**HIIT + Walking**: Walk on rest days for active recovery
**HIIT + Journaling**: Journal how you feel post-workout

Remember: The best workout is the one you'll actually do. HIIT is powerful, efficient, and accessible - perfect for managing stress while building physical health. Start where you are, progress at your pace, and enjoy the mental and physical benefits of this transformative practice.`
  }
];

async function createFitnessMaterials() {
  try {
    await sequelize.sync();
    
    console.log('🏋️ Creating fitness and exercise reading materials...\n');
    
    for (const material of fitnessContents) {
      // Check if material already exists
      const existing = await ReadingMaterial.findOne({
        where: { slug: material.slug }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping "${material.title}" - already exists`);
        continue;
      }
      
      // Create the material
      const newMaterial = await ReadingMaterial.create({
        counselorId: COUNSELOR_ID,
        title: material.title,
        slug: material.slug,
        category: material.category,
        excerpt: material.excerpt,
        content: material.content,
        fileType: 'article',
        readingTime: 12, // Average reading time in minutes
        isPublished: true,
        views: 0
      });
      
      console.log(`✅ Created: "${newMaterial.title}"`);
      console.log(`   ID: ${newMaterial.id}`);
      console.log(`   Category: ${newMaterial.category}`);
      console.log(`   Slug: ${newMaterial.slug}\n`);
    }
    
    console.log('🎉 All fitness materials created successfully!');
    console.log('\n📚 These materials are now available in the Reading Materials section.');
    console.log('💪 Users can access fitness guides via the Fitness Guide menu item in the sidebar.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating fitness materials:', error);
    process.exit(1);
  }
}

createFitnessMaterials();
