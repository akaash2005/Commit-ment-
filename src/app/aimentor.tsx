import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const AIMenu = () => {
  const [activeTab, setActiveTab] = useState('ask');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [question, setQuestion] = useState('');
  const [interests, setInterests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dreamPathResult, setDreamPathResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyBU66oGdzHauNYahWTaFFJ_sKV7POibyGY';

  const languages = {
    'en': 'English',
    'hi': 'हिंदी',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'ml': 'മലയാളം',
    'kn': 'ಕನ್ನಡ',
    'mr': 'मराठी',
    'bn': 'বাংলা',
    'gu': 'ગુજરાતી',
    'or': 'ଓଡ଼ିଆ'
  };

  const interestOptions = [
    'Science', 'Technology', 'Art', 'Music', 'Sports', 'Writing', 
    'Mathematics', 'History', 'Languages', 'Medicine', 'Engineering', 
    'Teaching', 'Business', 'Environment', 'Animals', 'Space'
  ];

  const languagePrompts = {
    'en': {
      askPlaceholder: 'Ask me anything! I\'ll explain it simply...',
      dreamPathTitle: 'Dream Path Career Guide',
      selectInterests: 'Select your interests:',
      explainSimply: 'Explain this in very simple words that a child can understand',
      careerGuidance: 'Based on these interests, suggest 3 suitable careers with exact steps including courses, scholarships, and how to find mentors. If Industrial Design is selected, include it as one of the career options with specific focus on product design, user experience, and manufacturing processes',
      askAnything: 'Ask Me Anything',
      generatePath: 'Generate Possible Career Paths',
      creating: 'Generating Career Paths...',
      thinking: 'Thinking...',
      ask: 'Ask',
      selectAtLeastOne: 'Please select at least one interest!'
    },
    'hi': {
      askPlaceholder: 'मुझसे कुछ भी पूछें! मैं आसान शब्दों में समझाऊंगा...',
      dreamPathTitle: 'सपनों का रास्ता - करियर गाइड',
      selectInterests: 'अपनी रुचियां चुनें:',
      explainSimply: 'इसे बहुत सरल शब्दों में समझाएं जो एक बच्चा समझ सके',
      careerGuidance: 'इन रुचियों के आधार पर, पाठ्यक्रम, छात्रवृत्ति और मेंटर खोजने के सटीक चरणों के साथ 3 उपयुक्त करियर सुझाएं। यदि औद्योगिक डिजाइन चुना गया है, तो इसे उत्पाद डिजाइन, उपयोगकर्ता अनुभव और विनिर्माण प्रक्रियाओं पर विशेष फोकस के साथ करियर विकल्पों में से एक के रूप में शामिल करें',
      askAnything: 'मुझसे कुछ भी पूछें',
      generatePath: 'संभावित करियर पथ जेनरेट करें',
      creating: 'करियर पथ बनाए जा रहे हैं...',
      thinking: 'सोच रहा हूं...',
      ask: 'पूछें',
      selectAtLeastOne: 'कृपया कम से कम एक रुचि चुनें!'
    },
    'ta': {
      askPlaceholder: 'என்னிடம் எதை வேண்டுமானாலும் கேளுங்கள்! எளிமையாக விளக்குகிறேன்...',
      dreamPathTitle: 'கனவு பாதை - தொழில் வழிகாட்டி',
      selectInterests: 'உங்கள் ஆர்வங்களை தேர்ந்தெடுக்கவும்:',
      explainSimply: 'இதை ஒரு குழந்தை புரிந்துகொள்ளக்கூடிய மிக எளிய வார்த்தைகளில் விளக்கவும்',
      careerGuidance: 'இந்த ஆர்வங்களின் அடிப்படையில், படிப்புகள், உதவித்தொகைகள் மற்றும் வழிகாட்டிகளை கண்டறியும் சரியான படிகளுடன் 3 பொருத்தமான தொழில்களை பரிந்துரைக்கவும்। தொழில்துறை வடிவமைப்பு தேர்ந்தெடுக்கப்பட்டால், தயாரிப்பு வடிவமைப்பு, பயனர் அனுபவம் மற்றும் உற்பத்தி செயல்முறைகளில் குறிப்பிட்ட கவனம் செலுத்துவதன் மூலம் அதை தொழில் விருப்பங்களில் ஒன்றாக சேர்க்கவும்',
      askAnything: 'என்னிடம் எதையும் கேளுங்கள்',
      generatePath: 'சாத்தியமான தொழில் பாதைகளை உருவாக்கு',
      creating: 'தொழில் பாதைகள் உருவாக்கப்படுகின்றன...',
      thinking: 'சிந்திக்கிறேன்...',
      ask: 'கேள்',
      selectAtLeastOne: 'தயவுசெய்து குறைந்தபட்சம் ஒரு ஆர்வத்தை தேர்ந்தெடுக்கவும்!'
    }
  };

  // Language Picker Component
  const LanguagePicker = () => {
    const [showPicker, setShowPicker] = useState(false);
    
    return (
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>🌍 Language:</Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Text style={styles.languageButtonText}>{languages[selectedLanguage]}</Text>
          <Text style={styles.dropdownIcon}>{showPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <View style={styles.languageDropdown}>
            <ScrollView style={styles.languageOptions} nestedScrollEnabled={true}>
              {Object.entries(languages).map(([code, name]) => (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === code && styles.selectedLanguageOption
                  ]}
                  onPress={() => {
                    setSelectedLanguage(code);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage === code && styles.selectedLanguageOptionText
                  ]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const callGeminiAPI = async (prompt, isCareerGuidance = false) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: isCareerGuidance ? 2048 : 1024,
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('API Error:', error);
      return 'Sorry, I encountered an error. Please try again!';
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    const userMessage = { type: 'user', text: question, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);

    const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];
    const prompt = `${prompts.explainSimply}: "${question}". Please respond in ${languages[selectedLanguage]} language.`;
    
    const response = await callGeminiAPI(prompt);
    
    const aiMessage = { type: 'ai', text: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMessage]);
    setQuestion('');
    setIsLoading(false);
  };

  const generateDreamPath = async () => {
    if (interests.length === 0) {
      const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];
      Alert.alert('⚠️', prompts.selectAtLeastOne);
      return;
    }

    setIsLoading(true);
    const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];
    const prompt = `${prompts.careerGuidance}: [${interests.join(', ')}]. Please respond in ${languages[selectedLanguage]} language. Format the response with clear career titles, required courses, scholarship opportunities, and mentorship guidance.`;
    
    const response = await callGeminiAPI(prompt, true);
    setDreamPathResult(response);
    setIsLoading(false);
  };

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧑‍🏫 AI Mentor</Text>
          <Text style={styles.subtitle}>Your pocket guide to learning and career dreams! 🌟</Text>
        </View>

        {/* Language Selector */}
        <LanguagePicker />

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ask' && styles.activeTab]}
            onPress={() => setActiveTab('ask')}
          >
            <Text style={[styles.tabText, activeTab === 'ask' && styles.activeTabText]}>
              💬 {prompts.askAnything}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dream' && styles.activeTab]}
            onPress={() => setActiveTab('dream')}
          >
            <Text style={[styles.tabText, activeTab === 'dream' && styles.activeTabText]}>
              🧭 Dream Path
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ask Me Anything Tab */}
        {activeTab === 'ask' && (
          <View style={styles.tabContent}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={question}
                onChangeText={setQuestion}
                placeholder={prompts.askPlaceholder}
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!question.trim() || isLoading) && styles.disabledButton]}
                onPress={askQuestion}
                disabled={!question.trim() || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.sendButtonText}> {prompts.thinking}</Text>
                  </View>
                ) : (
                  <Text style={styles.sendButtonText}>📤 {prompts.ask}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>👋 Hi! Ask me anything and I'll explain it simply!</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {messages.map((message) => (
                    <View
                      key={message.timestamp}
                      style={[
                        styles.messageWrapper,
                        message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper
                      ]}
                    >
                      <View
                        style={[
                          styles.messageContainer,
                          message.type === 'user' ? styles.userMessage : styles.aiMessage
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          { color: message.type === 'user' ? '#ffffff' : '#333333' }
                        ]}>
                          {message.text}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {isLoading && (
                    <View style={styles.aiMessageWrapper}>
                      <View style={styles.aiMessage}>
                        <View style={styles.typingIndicator}>
                          <Text style={styles.loadingText}>{prompts.thinking}</Text>
                          <ActivityIndicator color="#4F46E5" style={{ marginLeft: 8 }} />
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        {/* Dream Path Tab */}
        {activeTab === 'dream' && (
          <View style={styles.tabContent}>
            <Text style={styles.dreamPathTitle}>⭐ {prompts.dreamPathTitle}</Text>
            <Text style={styles.selectInterestsText}>{prompts.selectInterests}</Text>
            
            <View style={styles.interestsGrid}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    interests.includes(interest) && styles.selectedInterest
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[
                    styles.interestButtonText,
                    interests.includes(interest) && styles.selectedInterestText
                  ]}>
                    {interests.includes(interest) ? '✓ ' : ''}{interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateButton, (isLoading || interests.length === 0) && styles.disabledButton]}
              onPress={generateDreamPath}
              disabled={isLoading || interests.length === 0}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.generateButtonText}> {prompts.creating}</Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>
                  🎯 {prompts.generatePath}
                </Text>
              )}
            </TouchableOpacity>

            {dreamPathResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>🎯 Your Personalized Career Guide</Text>
                <ScrollView style={styles.resultScroll} nestedScrollEnabled={true}>
                  <Text style={styles.resultText}>{dreamPathResult}</Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  languageContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    zIndex: 1000,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  languageDropdown: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageOptions: {
    maxHeight: 200,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedLanguageOption: {
    backgroundColor: '#EBF8FF',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedLanguageOptionText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 50,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesContainer: {
    minHeight: 200,
    maxHeight: 400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  dreamPathTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectInterestsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  interestButton: {
    width: (width - 48) / 2 - 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedInterest: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  interestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    textAlign: 'center',
  },
  selectedInterestText: {
    color: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#FDF4FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});

export default AIMenu;