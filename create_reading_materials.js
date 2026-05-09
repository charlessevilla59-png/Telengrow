import { sequelize } from './models/db.js';
import './models/index.js';
import ReadingMaterialModel from './models/ReadingMaterialModel.js';

async function createReadingMaterials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Initialize ReadingMaterial model
    const ReadingMaterial = ReadingMaterialModel(sequelize);

    const materials = [
      {
        counselorId: 2, // Counselor account ID
        title: 'Understanding Anxiety: A Comprehensive Guide',
        slug: 'understanding-anxiety-guide',
        category: 'Mental Health',
        excerpt: 'Learn what anxiety is, how it affects your body, and practical strategies to manage anxiety symptoms effectively.',
        content: `# Understanding Anxiety: A Comprehensive Guide

## What is Anxiety?
Anxiety is a natural response to stress, characterized by feelings of worry, apprehension, or fear. When experienced occasionally, it can be helpful. However, persistent anxiety can interfere with daily life.

## Types of Anxiety Disorders
- Generalized Anxiety Disorder (GAD)
- Panic Disorder
- Social Anxiety Disorder
- Phobias
- Separation Anxiety

## Physical Symptoms of Anxiety
- Rapid heartbeat
- Shortness of breath
- Trembling or shaking
- Sweating
- Muscle tension
- Dizziness
- Sleep disturbances

## Coping Strategies
1. **Deep Breathing**: Practice diaphragmatic breathing
2. **Progressive Muscle Relaxation**: Tense and relax muscle groups
3. **Mindfulness Meditation**: Focus on the present moment
4. **Regular Exercise**: Physical activity reduces anxiety
5. **Healthy Diet**: Limit caffeine and sugar
6. **Sleep Hygiene**: Maintain consistent sleep schedule
7. **Social Support**: Connect with friends and family
8. **Professional Help**: Seek therapy when needed

## When to Seek Help
Contact a mental health professional if anxiety:
- Interferes with daily activities
- Persists for more than 2 weeks
- Causes physical symptoms
- Disrupts relationships or work

Remember, anxiety is treatable. With proper support and strategies, you can manage and overcome it.`,
        fileType: 'article',
        readingTime: 8,
        isPublished: true,
        views: 0
      },
      {
        counselorId: 2,
        title: 'Breathing Techniques for Stress Relief',
        slug: 'breathing-techniques-stress',
        category: 'Stress Management',
        excerpt: 'Master simple yet powerful breathing exercises that can instantly calm your nervous system and reduce stress levels.',
        content: `# Breathing Techniques for Stress Relief

## The Power of Breathing
Your breath is a powerful tool for managing stress and anxiety. By controlling your breathing, you can activate your parasympathetic nervous system and promote relaxation.

## Essential Breathing Techniques

### 1. Box Breathing (4-4-4-4 Breathing)
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold for 4 counts
- Repeat 5-10 times

Benefits: Calms the mind, reduces anxiety, improves focus

### 2. 4-7-8 Breathing
- Inhale through nose for 4 counts
- Hold breath for 7 counts
- Exhale through mouth for 8 counts
- Repeat 4-8 times

Benefits: Promotes relaxation, helps with sleep, reduces panic

### 3. Alternate Nostril Breathing (Nadi Shodhana)
- Close right nostril, inhale through left
- Close left nostril, exhale through right
- Inhale through right, exhale through left
- Continue for 5 minutes

Benefits: Balances nervous system, reduces stress, improves focus

### 4. Diaphragmatic Breathing
- Sit comfortably with hand on belly
- Breathe in slowly through nose, feeling belly expand
- Exhale slowly through mouth
- Continue for 5-10 minutes

Benefits: Activates relaxation response, reduces muscle tension

## Quick Stress Relief Technique (2 Minutes)
1. Find a quiet space
2. Practice box breathing for 5 cycles
3. Notice the calm that follows
4. Use whenever you feel stressed

## Tips for Success
- Practice daily for best results
- Start with 2-3 minutes, gradually increase
- Be patient with yourself
- Consistency is key

These techniques can be done anywhere, anytime, making them perfect for managing stress in your daily life.`,
        fileType: 'article',
        readingTime: 7,
        isPublished: true,
        views: 0
      },
      {
        counselorId: 2,
        title: 'Mindfulness and Meditation for Mental Wellness',
        slug: 'mindfulness-meditation-wellness',
        category: 'Mental Health',
        excerpt: 'Discover how mindfulness and meditation can transform your mental health and build resilience against stress and anxiety.',
        content: `# Mindfulness and Meditation for Mental Wellness

## What is Mindfulness?
Mindfulness is the practice of being fully present and engaged in the moment, without judgment. It involves paying attention to your thoughts, feelings, and surroundings with openness and curiosity.

## Benefits of Mindfulness
- Reduces stress and anxiety
- Improves emotional regulation
- Enhances focus and concentration
- Promotes self-awareness
- Improves sleep quality
- Increases overall well-being

## Getting Started with Meditation

### Beginner Meditation (10 minutes)
1. Find a quiet, comfortable place
2. Sit with your back straight
3. Close your eyes gently
4. Focus on your natural breath
5. When your mind wanders, gently bring focus back to breath
6. Practice daily for best results

### Body Scan Meditation
- Lie down comfortably
- Starting from toes, mentally scan each body part
- Notice sensations without judgment
- Slowly move attention up through entire body
- Duration: 10-20 minutes

### Walking Meditation
- Walk slowly in a quiet space
- Focus on each step, the sensation of feet touching ground
- Notice surroundings without judgment
- Breathe naturally
- Duration: 10-20 minutes

## Mindfulness in Daily Life
- Mindful eating: Savor each bite, notice flavors and textures
- Mindful listening: Fully focus on what others are saying
- Mindful breaks: Take 2-minute pauses throughout day
- Mindful walking: Pay attention to your surroundings

## Overcoming Common Challenges
- Racing thoughts are normal, gently redirect focus
- Restlessness improves with practice
- Start with shorter sessions, gradually increase
- Use guided meditations if helpful

## Creating a Practice Routine
- Choose a consistent time
- Start with 5-10 minutes daily
- Find a comfortable space
- Be patient and compassionate with yourself

With regular practice, mindfulness and meditation can transform your relationship with stress and anxiety.`,
        fileType: 'article',
        readingTime: 9,
        isPublished: true,
        views: 0
      },
      {
        counselorId: 2,
        title: 'Sleep and Mental Health: The Connection',
        slug: 'sleep-mental-health-connection',
        category: 'Wellness',
        excerpt: 'Understand how sleep affects your mental health and learn evidence-based strategies to improve sleep quality and emotional resilience.',
        content: `# Sleep and Mental Health: The Connection

## Why Sleep Matters
Sleep is not a luxury—it\'s essential for physical and mental health. During sleep, your brain processes emotions, consolidates memories, and repairs itself.

## Sleep and Mental Health Link
- Poor sleep worsens anxiety and depression
- Sleep deprivation impairs emotional regulation
- Good sleep improves mood and resilience
- Sleep disorders often accompany mental health conditions

## Sleep Stages and Importance
- **Light Sleep (Stages 1-2)**: Transition to deeper sleep
- **Deep Sleep (Stage 3)**: Physical restoration, memory consolidation
- **REM Sleep**: Emotional processing, brain development

Complete sleep cycles last 90 minutes; aim for 4-5 cycles per night (7-9 hours).

## Sleep Hygiene Tips

### Create the Right Environment
- Keep bedroom cool, dark, and quiet
- Invest in comfortable mattress and pillows
- Remove digital devices from bedroom
- Use blackout curtains if needed

### Establish a Consistent Schedule
- Go to bed and wake at same time daily
- Maintain schedule even on weekends
- Allow 1-2 hour wind-down before bed

### Pre-Sleep Routine
- Avoid caffeine 6-8 hours before bed
- Limit screens 1 hour before sleep
- Practice relaxation techniques
- Enjoy light stretching or yoga

### Food and Drink
- Avoid heavy meals close to bedtime
- Skip alcohol (disrupts sleep quality)
- Limit water intake before bed
- Try warm milk or herbal tea

## Managing Sleep Issues

### For Difficulty Falling Asleep
- Progressive muscle relaxation
- Box breathing technique
- Guided sleep meditation
- Keep bedroom temperature around 65°F

### For Night Waking
- Practice mindfulness rather than anxiety about sleep
- Avoid checking clock
- Get up if awake 20+ minutes, do quiet activity
- Avoid caffeine throughout day

### For Early Morning Waking
- Keep bedroom dark
- Maintain consistent sleep schedule
- Manage stress during day
- Consider professional help if chronic

## When to Seek Help
- Persistent sleep problems lasting 3+ months
- Sleep apnea symptoms (loud snoring, pauses in breathing)
- Narcolepsy symptoms (sudden daytime sleep)
- Medication side effects affecting sleep

## Action Plan
1. Assess current sleep patterns
2. Implement 2-3 sleep hygiene changes
3. Allow 2-3 weeks to notice improvements
4. Seek professional help if issues persist

Better sleep leads to better mental health. Start improving your sleep tonight!`,
        fileType: 'article',
        readingTime: 10,
        isPublished: true,
        views: 0
      },
      {
        counselorId: 2,
        title: 'Daily Coping Strategies for Stress Management',
        slug: 'daily-coping-strategies-stress',
        category: 'Stress Management',
        excerpt: 'Practical, evidence-based coping strategies you can implement immediately to manage daily stress and build long-term emotional resilience.',
        content: `# Daily Coping Strategies for Stress Management

## Understanding Stress
Stress is your body\'s response to demands. While some stress motivates us, chronic stress can harm physical and mental health. Learning to manage stress is essential.

## Immediate Stress Relief (0-5 Minutes)

### 1. 5-4-3-2-1 Grounding Technique
- Name 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

### 2. Quick Body Scan
- Notice tension in body
- Consciously relax tight muscles
- Breathe deeply
- Takes only 2-3 minutes

### 3. Cold Water Splash
- Splash face with cold water
- Activates parasympathetic response
- Instantly calming effect

### 4. Power Posing
- Stand in confident pose for 2 minutes
- Reduces stress hormones
- Boosts confidence

## Short-Term Strategies (15-30 Minutes)

### Exercise and Movement
- Walk briskly for 15 minutes
- Dance to your favorite songs
- Yoga or stretching
- Swimming or other sports

Benefits: Releases stress hormones, improves mood, increases energy

### Creative Expression
- Journaling: Write freely for 15 minutes
- Drawing or painting
- Playing music
- Creative writing

Benefits: Processes emotions, provides perspective, induces flow state

### Social Connection
- Call a friend
- Meet for coffee
- Join a group activity
- Volunteer

Benefits: Reduces isolation, provides support, releases oxytocin

### Nature Exposure
- Walk in parks
- Sit by water
- Garden
- Notice natural beauty

Benefits: Lowers cortisol, improves mood, reduces anxiety

## Long-Term Stress Management

### Daily Practices
- Morning meditation (10 minutes)
- Regular exercise (30 minutes, 5x weekly)
- Healthy eating (balanced nutrition)
- Consistent sleep schedule (7-9 hours)

### Weekly Activities
- Social time with friends/family
- Hobbies you enjoy
- Relaxation activities
- Outdoor activities

### Monthly Reviews
- Assess stress levels
- Identify stress sources
- Adjust strategies as needed
- Celebrate successes

## Coping Strategies to Avoid
- Substance use (alcohol, drugs)
- Excessive food or sugar
- Social withdrawal
- Negative self-talk
- Procrastination

## Building Resilience
1. **Develop healthy self-talk**: Challenge negative thoughts
2. **Set boundaries**: Learn to say no
3. **Practice self-compassion**: Treat yourself with kindness
4. **Find purpose**: Engage in meaningful activities
5. **Maintain perspective**: Focus on what you can control

## Creating Your Stress Management Plan
1. Identify your main stress sources
2. Choose 3 immediate relief techniques
3. Commit to 2 daily stress-reduction habits
4. Schedule weekly stress-relief activities
5. Review and adjust monthly

## When to Seek Professional Help
- Stress feels overwhelming
- Coping strategies aren't working
- Sleep or eating patterns change significantly
- Persistent sadness or hopelessness
- Thoughts of harming yourself

Remember: Managing stress is a skill that improves with practice. Be patient with yourself and celebrate small progress.`,
        fileType: 'article',
        readingTime: 12,
        isPublished: true,
        views: 0
      }
    ];

    // Insert materials into database
    for (const material of materials) {
      const created = await ReadingMaterial.create(material);
      console.log(`✅ Created: "${created.title}"`);
    }

    console.log('\n✅ All 5 reading materials created successfully!');
    console.log('\nMaterials created:');
    console.log('1. Understanding Anxiety: A Comprehensive Guide');
    console.log('2. Breathing Techniques for Stress Relief');
    console.log('3. Mindfulness and Meditation for Mental Wellness');
    console.log('4. Sleep and Mental Health: The Connection');
    console.log('5. Daily Coping Strategies for Stress Management');
    console.log('\nCounselors can now share these materials with students!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating materials:', err.message);
    process.exit(1);
  }
}

createReadingMaterials();
