import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Quiz Data
const quizData = [
  {
    level: 1,
    title: "Basics (Greetings & Simple Words)",
    questions: [
      { q: "How do you say 'Hello' in English?", options: ["Hola", "Bonjour", "Hello", "Ciao"], answer: "Hello" },
      { q: "'Goodbye' means:", options: ["See you", "Please", "Thank you", "Sorry"], answer: "See you" },
      { q: "'Thank you' shows:", options: ["Asking", "Gratitude", "Angry", "Sleep"], answer: "Gratitude" },
      { q: "Which word means 'Yes'?", options: ["No", "Yes", "Maybe", "Why"], answer: "Yes" },
      { q: "Which word means 'No'?", options: ["Yes", "No", "Please", "Thanks"], answer: "No" },
      { q: "How do you greet someone in the morning?", options: ["Good Night", "Good Morning", "Good Evening", "Goodbye"], answer: "Good Morning" },
      { q: "How do you greet at night?", options: ["Good Morning", "Good Evening", "Good Night", "Hello"], answer: "Good Night" },
      { q: "Which word means 'Sorry'?", options: ["Thank you", "Sorry", "Hello", "Goodbye"], answer: "Sorry" },
      { q: "If someone helps you, you say:", options: ["Please", "Thanks", "No", "Hello"], answer: "Thanks" },
      { q: "When asking politely, you say:", options: ["Please", "Go", "Yes", "Hi"], answer: "Please" }
    ]
  },
  {
    level: 2,
    title: "Numbers & Colors",
    questions: [
      { q: "What is 'One'?", options: ["1", "2", "3", "4"], answer: "1" },
      { q: "What is 'Two'?", options: ["2", "5", "8", "10"], answer: "2" },
      { q: "What is 'Five'?", options: ["2", "5", "7", "9"], answer: "5" },
      { q: "What is 'Ten'?", options: ["8", "10", "12", "20"], answer: "10" },
      { q: "What color is the sky?", options: ["Blue", "Red", "Green", "Black"], answer: "Blue" },
      { q: "What color is grass?", options: ["Red", "Yellow", "Green", "White"], answer: "Green" },
      { q: "What color is blood?", options: ["Yellow", "Red", "Blue", "Pink"], answer: "Red" },
      { q: "What color is milk?", options: ["White", "Blue", "Brown", "Black"], answer: "White" },
      { q: "Banana is usually:", options: ["Yellow", "Blue", "Purple", "Red"], answer: "Yellow" },
      { q: "Grass + Sky = ?", options: ["Red & Blue", "Blue & Green", "White & Yellow", "Black & Red"], answer: "Blue & Green" }
    ]
  },
  {
    level: 3,
    title: "Everyday Objects",
    questions: [
      { q: "What do you sit on?", options: ["Chair", "Table", "Book", "Bag"], answer: "Chair" },
      { q: "What do you write in?", options: ["Chair", "Book", "Bag", "Cup"], answer: "Book" },
      { q: "What do you drink water from?", options: ["Cup", "Chair", "Pen", "Bag"], answer: "Cup" },
      { q: "What do you carry to school?", options: ["Bag", "Chair", "Table", "Cup"], answer: "Bag" },
      { q: "Which object helps you write?", options: ["Pen", "Book", "Cup", "Bag"], answer: "Pen" },
      { q: "What do you read?", options: ["Book", "Bag", "Cup", "Chair"], answer: "Book" },
      { q: "Which one is furniture?", options: ["Chair", "Pen", "Cup", "Bag"], answer: "Chair" },
      { q: "What do you sleep on?", options: ["Bed", "Chair", "Table", "Book"], answer: "Bed" },
      { q: "What shows you time?", options: ["Clock", "Cup", "Chair", "Book"], answer: "Clock" },
      { q: "What do you use to eat rice?", options: ["Spoon", "Cup", "Pen", "Bag"], answer: "Spoon" }
    ]
  },
  {
    level: 4,
    title: "Everyday Words",
    questions: [
      { q: "Choose the fruit:", options: ["Apple", "Chair", "Run", "Blue"], answer: "Apple" },
      { q: "Choose the animal:", options: ["Dog", "Table", "Book", "Pen"], answer: "Dog" },
      { q: "Choose the color:", options: ["Red", "Book", "Chair", "Run"], answer: "Red" },
      { q: "Choose the place:", options: ["School", "Dog", "Eat", "Blue"], answer: "School" },
      { q: "Choose the object:", options: ["Table", "Run", "Happy", "Eat"], answer: "Table" },
      { q: "Choose the action:", options: ["Run", "Pen", "Chair", "Book"], answer: "Run" },
      { q: "Choose the drink:", options: ["Water", "Chair", "Book", "Red"], answer: "Water" },
      { q: "Choose the emotion:", options: ["Happy", "Table", "Apple", "Run"], answer: "Happy" },
      { q: "Choose the vehicle:", options: ["Bus", "Pen", "Book", "Eat"], answer: "Bus" },
      { q: "Choose the family member:", options: ["Mother", "Table", "Run", "Chair"], answer: "Mother" }
    ]
  },
  {
    level: 5,
    title: "Simple Sentences",
    questions: [
      { q: "I ___ a book.", options: ["read", "red", "blue", "run"], answer: "read" },
      { q: "She ___ water.", options: ["drinks", "pen", "table", "blue"], answer: "drinks" },
      { q: "They ___ football.", options: ["play", "apple", "run", "chair"], answer: "play" },
      { q: "He ___ to school.", options: ["goes", "book", "dog", "eat"], answer: "goes" },
      { q: "We ___ happy.", options: ["are", "pen", "run", "chair"], answer: "are" },
      { q: "The sun ___ hot.", options: ["is", "blue", "book", "pen"], answer: "is" },
      { q: "I ___ ten years old.", options: ["am", "dog", "chair", "eat"], answer: "am" },
      { q: "You ___ my friend.", options: ["are", "book", "pen", "blue"], answer: "are" },
      { q: "The dog ___ fast.", options: ["runs", "pen", "eat", "chair"], answer: "runs" },
      { q: "We ___ dinner.", options: ["eat", "blue", "pen", "chair"], answer: "eat" }
    ]
  },
  {
    level: 6,
    title: "Present Continuous",
    questions: [
      { q: "I ___ reading a book.", options: ["am", "is", "are", "be"], answer: "am" },
      { q: "She ___ playing football.", options: ["is", "am", "are", "be"], answer: "is" },
      { q: "They ___ eating lunch.", options: ["are", "am", "is", "be"], answer: "are" },
      { q: "We ___ going to school.", options: ["are", "am", "is", "be"], answer: "are" },
      { q: "He ___ writing homework.", options: ["is", "am", "are", "be"], answer: "is" },
      { q: "The children ___ running.", options: ["are", "is", "am", "be"], answer: "are" },
      { q: "I ___ cooking food.", options: ["am", "is", "are", "be"], answer: "am" },
      { q: "She ___ singing a song.", options: ["is", "am", "are", "be"], answer: "is" },
      { q: "We ___ playing cricket.", options: ["are", "am", "is", "be"], answer: "are" },
      { q: "He ___ watching TV.", options: ["is", "am", "are", "be"], answer: "is" }
    ]
  },
  {
    level: 7,
    title: "Past Tense Basics",
    questions: [
      { q: "I ___ to school yesterday.", options: ["go", "went", "gone", "going"], answer: "went" },
      { q: "She ___ a book last night.", options: ["reads", "read", "reading", "reads"], answer: "read" },
      { q: "They ___ football last week.", options: ["play", "played", "playing", "plays"], answer: "played" },
      { q: "We ___ pizza yesterday.", options: ["eat", "ate", "eaten", "eating"], answer: "ate" },
      { q: "He ___ a song on stage.", options: ["sing", "sang", "sung", "singing"], answer: "sang" },
      { q: "The teacher ___ the lesson.", options: ["teach", "teaches", "taught", "teaching"], answer: "taught" },
      { q: "I ___ a movie last weekend.", options: ["watch", "watched", "watching", "watches"], answer: "watched" },
      { q: "They ___ to the park.", options: ["go", "went", "gone", "going"], answer: "went" },
      { q: "She ___ her homework.", options: ["do", "did", "done", "doing"], answer: "did" },
      { q: "We ___ happy to see him.", options: ["was", "were", "is", "are"], answer: "were" }
    ]
  },
  {
    level: 8,
    title: "Future Tense Basics",
    questions: [
      { q: "I ___ go tomorrow.", options: ["will", "did", "was", "had"], answer: "will" },
      { q: "She ___ study tonight.", options: ["will", "was", "did", "had"], answer: "will" },
      { q: "They ___ visit us next week.", options: ["will", "were", "did", "has"], answer: "will" },
      { q: "We ___ play cricket tomorrow.", options: ["will", "did", "was", "had"], answer: "will" },
      { q: "He ___ come to school later.", options: ["will", "was", "did", "had"], answer: "will" },
      { q: "The teacher ___ explain again.", options: ["will", "was", "did", "has"], answer: "will" },
      { q: "I ___ call you soon.", options: ["will", "did", "was", "had"], answer: "will" },
      { q: "We ___ meet at 5 pm.", options: ["will", "did", "was", "has"], answer: "will" },
      { q: "She ___ finish homework later.", options: ["will", "was", "did", "had"], answer: "will" },
      { q: "They ___ travel next year.", options: ["will", "were", "did", "has"], answer: "will" }
    ]
  },
  {
    level: 9,
    title: "Simple Conversations",
    questions: [
      { q: "How are you? — I am ___", options: ["fine", "apple", "run", "chair"], answer: "fine" },
      { q: "What is your name? — My name is ___", options: ["book", "John", "table", "happy"], answer: "John" },
      { q: "Where do you live? — I live in ___", options: ["city", "cat", "eat", "pen"], answer: "city" },
      { q: "What do you like? — I like ___", options: ["reading", "sleep", "blue", "yes"], answer: "reading" },
      { q: "Do you like apples? — Yes, I ___", options: ["do", "am", "was", "will"], answer: "do" },
      { q: "What time is it? — It is ___", options: ["3 o'clock", "apple", "pen", "go"], answer: "3 o'clock" },
      { q: "How old are you? — I am ___ years old.", options: ["ten", "eat", "book", "yes"], answer: "ten" },
      { q: "Do you play cricket? — Yes, I ___", options: ["do", "am", "was", "will"], answer: "do" },
      { q: "Can you help me? — Yes, I ___", options: ["can", "am", "was", "will"], answer: "can" },
      { q: "Where are you going? — I am going to ___", options: ["school", "pen", "sleep", "eat"], answer: "school" }
    ]
  },
  {
    level: 10,
    title: "Everyday Situations",
    questions: [
      { q: "You are hungry. You say: ___", options: ["I want food", "I am sleep", "I am red", "I go run"], answer: "I want food" },
      { q: "You are thirsty. You say: ___", options: ["I want water", "I am pen", "I am ten", "I go read"], answer: "I want water" },
      { q: "You feel sick. You say: ___", options: ["I need a doctor", "I need a pen", "I am chair", "I go school"], answer: "I need a doctor" },
      { q: "You want to buy something. You say: ___", options: ["How much is this?", "Where are you?", "What time is it?", "I am happy"], answer: "How much is this?" },
      { q: "You want help. You say: ___", options: ["Please help me", "I am food", "Where pen", "I go run"], answer: "Please help me" },
      { q: "You want to find the toilet. You ask: ___", options: ["Where is the toilet?", "How are you?", "What color?", "I am chair"], answer: "Where is the toilet?" },
      { q: "You want to pay. You say: ___", options: ["Here is money", "I am fine", "I go home", "What is this"], answer: "Here is money" },
      { q: "You are lost. You ask: ___", options: ["Can you show me the way?", "I am table", "What pen", "I eat food"], answer: "Can you show me the way?" },
      { q: "You want to sit. You say: ___", options: ["Can I sit here?", "What is time?", "I am pen", "Go school"], answer: "Can I sit here?" },
      { q: "You meet a new person. You say: ___", options: ["Nice to meet you", "I am run", "What book", "I go red"], answer: "Nice to meet you" }
    ]
  }
];

// Gemini API Configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBYWlFiGMMKYwcI00mbUVXDmc-Pmmjf-fw';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (showChat) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: height,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [showChat]);

  const getCurrentQuestion = () => {
    if (!selectedLevel) return null;
    const level = quizData.find(l => l.level === selectedLevel);
    return level?.questions[currentQuestionIndex];
  };

  const getCurrentLevel = () => {
    if (!selectedLevel) return null;
    return quizData.find(l => l.level === selectedLevel);
  };

  const getAIExplanation = async (question, userAnswer, correctAnswer, isCorrect) => {
    setIsLoading(true);
    
    const prompt = `You are a friendly English teacher helping a beginner student. 
    
Question: "${question}"
Student's answer: "${userAnswer}"
Correct answer: "${correctAnswer}"
Result: ${isCorrect ? 'CORRECT ✅' : 'WRONG ❌'}

Please provide a simple, encouraging explanation in 3-4 short sentences. Use simple English.

Format your response like this:
${isCorrect ? '🎉 Great job!' : '💡 Let me help you understand!'}

[Your explanation here]

${!isCorrect ? `Remember: ${correctAnswer} is correct because...` : 'Keep up the good work!'}`;

    // Check if API key is properly configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
      console.warn('Gemini API key not configured properly');
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: '⚠️ AI explanation service is not configured. Please set up your API key to get personalized explanations.\n\n' + 
              (isCorrect 
                ? '🎉 Great job! You got it right! Keep practicing to improve your English.' 
                : `💡 The correct answer is "${correctAnswer}". Don't worry, making mistakes is how we learn! Try to remember this for next time.`),
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return;
    }

    let retryCount = 0;
    const maxRetries = 2;

    const attemptAPICall = async () => {
      try {
        console.log('Attempting API call to Gemini...', { retryCount });
        
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
              topP: 0.8,
              topK: 40
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Full API Response received:', JSON.stringify(data, null, 2));
        
        // Check if response has the expected structure
        if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
          console.error('Invalid API response structure - no candidates:', JSON.stringify(data, null, 2));
          throw new Error('Invalid response structure from API - no candidates found');
        }

        const candidate = data.candidates[0];
        console.log('Processing candidate:', JSON.stringify(candidate, null, 2));
        
        // Handle different response structures with comprehensive fallbacks
        let aiResponse = null;
        
        // Try multiple extraction paths
        const extractionPaths = [
          () => candidate.content?.parts?.[0]?.text,
          () => candidate.content?.text,
          () => candidate.text,
          () => candidate.output,
          () => candidate.message?.content,
          () => candidate.generated_text,
          () => candidate.content?.parts?.map(part => part.text).join(''),
        ];
        
        for (const extractPath of extractionPaths) {
          try {
            const extracted = extractPath();
            if (extracted && typeof extracted === 'string' && extracted.trim()) {
              aiResponse = extracted.trim();
              console.log('Successfully extracted text using path:', extractPath.toString());
              break;
            }
          } catch (e) {
            console.log('Extraction path failed:', e.message);
            continue;
          }
        }
        
        // Handle partial content or finish reason issues
        if (!aiResponse && candidate.finishReason) {
          console.warn('Response may be incomplete due to finish reason:', candidate.finishReason);
          if (candidate.finishReason === 'MAX_TOKENS') {
            aiResponse = 'Response was cut off due to length limits. Let me give you a shorter explanation: ' + 
                        (isCorrect ? '🎉 Great job! You got it right!' : `💡 The correct answer is "${correctAnswer}". Keep practicing!`);
          } else if (candidate.finishReason === 'SAFETY') {
            aiResponse = 'Content filtered for safety. Here\'s a simple explanation: ' + 
                        (isCorrect ? '🎉 Well done!' : `💡 The right answer is "${correctAnswer}".`);
          }
        }
        
        if (!aiResponse) {
          console.error('Could not extract any text from API response. Full candidate object:', JSON.stringify(candidate, null, 2));
          throw new Error('Could not extract text from API response - all extraction methods failed');
        }
        
        setChatMessages(prev => [...prev, {
          type: 'ai',
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        console.log('AI explanation successfully generated');
        return true; // Success
        
      } catch (error) {
        console.error('API call attempt failed:', error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying API call... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
          return attemptAPICall();
        } else {
          // All retries failed, show error message with fallback
          console.error('All API retry attempts failed');
          setChatMessages(prev => [...prev, {
            type: 'ai',
            text: `🤖 I'm having trouble connecting to my AI teacher right now. Let me give you a quick explanation:\n\n` +
                  (isCorrect 
                    ? '🎉 Great job! You got it right! Keep practicing to improve your English.' 
                    : `💡 The correct answer is "${correctAnswer}". Don't worry, making mistakes is how we learn! Try to remember this for next time.`) +
                  '\n\n🔄 Please try again in a moment for a detailed AI explanation.',
            timestamp: new Date().toLocaleTimeString()
          }]);
          return false; // Failed
        }
      }
    };

    await attemptAPICall();
    
    setIsLoading(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAnswerSelect = async (answer) => {
    const question = getCurrentQuestion();
    if (!question || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === question.answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Add user's answer to chat
    setChatMessages(prev => [...prev, {
      type: 'user',
      text: `I selected: ${answer}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    // Get AI explanation
    await getAIExplanation(question.q, answer, question.answer, isCorrect);
    
    // Auto show chat for wrong answers
    if (!isCorrect && !showChat) {
      setShowChat(true);
    }
  };

  const handleNextQuestion = () => {
    const level = getCurrentLevel();
    if (currentQuestionIndex < level.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setLevelComplete(true);
    }
  };

  const resetLevel = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setChatMessages([]);
    setLevelComplete(false);
    setShowChat(false);
  };

  const handleBackToLevels = () => {
    resetLevel();
    setSelectedLevel(null);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    setChatMessages(prev => [...prev, {
      type: 'user',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setIsLoading(true);
    
    const currentQ = getCurrentQuestion();
    const prompt = `You are a friendly English tutor. The student is learning English and is currently on this question:
    
Question: "${currentQ?.q}"
Correct Answer: "${currentQ?.answer}"

The student asks: "${userMessage}"

Please provide a helpful, simple response in 2-3 sentences using basic English. If they ask about the current question, help them understand it better.`;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: "I'm here to help! Feel free to ask me anything about this question or English in general.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Level Selection Screen
  if (!selectedLevel) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.levelContainer, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitle}>🌟 English Learning Journey</Text>
          <Text style={styles.subtitle}>Choose your level and start learning!</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {quizData.map((level) => (
              <TouchableOpacity
                key={level.level}
                style={[styles.levelCard, { backgroundColor: `hsl(${level.level * 30}, 70%, 95%)` }]}
                onPress={() => setSelectedLevel(level.level)}
                activeOpacity={0.8}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelNumber}>Level {level.level}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.badgeText}>{level.questions.length} Questions</Text>
                  </View>
                </View>
                <Text style={styles.levelTitle}>{level.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Level Complete Screen
  if (levelComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🏆</Text>
          <Text style={styles.completeTitle}>Level Complete!</Text>
          <Text style={styles.completeScore}>
            You scored {score} out of {getCurrentLevel()?.questions.length}
          </Text>
          <Text style={styles.completePercentage}>
            {Math.round((score / getCurrentLevel()?.questions.length) * 100)}% Correct
          </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={resetLevel}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToLevels}>
            <Text style={styles.secondaryButtonText}>Choose Another Level</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const question = getCurrentQuestion();
  const level = getCurrentLevel();

  // Quiz Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.quizContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToLevels} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.levelIndicator}>Level {selectedLevel}</Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentQuestionIndex + 1) / level.questions.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {level.questions.length}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question?.q}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question?.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.answer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && !showResult && styles.selectedOption,
                    showCorrect && styles.correctOption,
                    showWrong && styles.wrongOption,
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.resultOptionText
                  ]}>
                    {option}
                  </Text>
                  {showCorrect && <Text style={styles.resultIcon}>✓</Text>}
                  {showWrong && <Text style={styles.resultIcon}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          {showResult && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < level.questions.length - 1 ? 'Next Question →' : 'Finish Level'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Chat Toggle Button */}
          <TouchableOpacity 
            style={styles.chatToggleButton} 
            onPress={() => setShowChat(!showChat)}
          >
            <Text style={styles.chatToggleText}>
              {showChat ? '💬 Hide Tutor' : '💬 Ask AI Tutor'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <Animated.View 
          style={[
            styles.chatContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>🤖 AI English Tutor</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Text style={styles.closeChat}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {chatMessages.length === 0 && (
              <Text style={styles.welcomeMessage}>
                Hi! I'm your AI tutor. Ask me anything about the current question or English in general! 📚
              </Text>
            )}
            {chatMessages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.message,
                  msg.type === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                <Text style={msg.type === 'user' ? styles.userMessageText : styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{msg.timestamp}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Ask me anything..."
              placeholderTextColor="#999"
              multiline
              maxLength={200}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  // Level Selection Styles
  levelContainer: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  levelCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  levelTitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  
  // Quiz Screen Styles
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  levelIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scoreText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '600',
  },
  
  // Progress Bar
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  
  // Question
  questionContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    color: '#2C3E50',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Options
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F8FF',
  },
  correctOption: {
    borderColor: '#27AE60',
    backgroundColor: '#E8F5E9',
  },
  wrongOption: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  resultOptionText: {
    fontWeight: 'bold',
  },
  resultIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Buttons
  nextButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatToggleButton: {
    backgroundColor: '#8E44AD',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  chatToggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Chat Interface
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeChat: {
    fontSize: 24,
    color: '#7F8C8D',
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  message: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  userMessageText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#7F8C8D',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#2C3E50',
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Complete Screen
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  completeScore: {
    fontSize: 24,
    color: '#4A90E2',
    marginBottom: 10,
  },
  completePercentage: {
    fontSize: 20,
    color: '#27AE60',
    marginBottom: 40,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;
