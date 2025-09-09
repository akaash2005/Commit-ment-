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
  const [activeTab, setActiveTab] = useState<string>('ask');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [question, setQuestion] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [dreamPathResult, setDreamPathResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      askPlaceholder: 'Ask me anything about careers and money! I\'ll explain simply...',
      dreamPathTitle: '💰 Career Paths',
      selectInterests: '🎯 Choose interests to discover careers:',
      explainSimply: 'Explain this in very simple words that a child can understand',
      careerGuidance: `Based on these interests, provide 3 HIGH-EARNING career options with complete FINANCIAL BREAKDOWN:

      FOR EACH CAREER, PROVIDE:
      💰 SALARY DETAILS (in INR):
      - Starting salary (Fresh graduate): ₹XX,XXX per month
      - After 2 years: ₹XX,XXX per month  
      - After 5 years: ₹XX,XXX per month
      - Senior level (10+ years): ₹X,XX,XXX per month
      - TOP earning potential: ₹X,XX,XXX per month

      🏠 LIFESTYLE BENEFITS:
      - Can afford: House/Car/Education for children
      - Social status: High/Medium respect in society
      - Job security: High/Medium/Low
      
      💼 CORPORATE BENEFITS:
      - Medical insurance worth ₹X lakhs
      - Provident Fund (PF) contribution
      - Annual bonuses: X months salary
      - Free training/certifications worth ₹X lakhs
      - International travel opportunities

      📚 EDUCATION PATH (Step-by-step):
      - Required degree/diploma (exact course names)
      - Duration: X years
      - Average education cost: ₹X lakhs
      - ROI: Earn back education cost in X years

      🎓 FREE SCHOLARSHIPS:
      - Government schemes (exact names like PM Scholarship, Merit Scholarship)
      - Private company scholarships
      - How to apply (websites/process)

      💻 SKILL DEVELOPMENT:
      - Online courses (Coursera/edX/SWAYAM - many FREE)
      - Industry certifications
      - Internship opportunities

      🏢 TOP HIRING COMPANIES:
      - List of companies that pay highest salaries
      - Starting packages they offer
      - How to get placed there

      🌍 INTERNATIONAL OPPORTUNITIES:
      - Countries with high demand
      - Salary in foreign countries (convert to INR)
      - Immigration pathways

      For Industrial Design specifically: Include salary range ₹25,000 (fresher) to ₹3,00,000+ (senior) per month, mention luxury brands, automotive companies, and product design firms that pay premium salaries.

      FORMAT: Use lots of emojis, clear sections, and emphasize MONEY and LIFESTYLE BENEFITS throughout. Make parents understand this is a path to PROSPERITY and FINANCIAL FREEDOM for their children.`,
      askAnything: '💬 Ask About Money & Careers',
      generatePath: '💰 Show Me High-Paying Careers',
      creating: '💰 Finding High-Earning Career Paths...',
      thinking: '💭 Calculating earning potential...',
      ask: 'Ask',
      selectAtLeastOne: '⚠️ Select at least one interest to see earning opportunities!'
    },
    'hi': {
      askPlaceholder: 'करियर और पैसे के बारे में कुछ भी पूछें! मैं आसान शब्दों में समझाऊंगा...',
      dreamPathTitle: '💰 ज्यादा पैसे कमाने वाले करियर',
      selectInterests: '🎯 अच्छी सैलरी वाले करियर जानने के लिए रुचियां चुनें:',
      explainSimply: 'इसे बहुत सरल शब्दों में समझाएं जो एक बच्चा समझ सके',
      careerGuidance: `इन रुचियों के आधार पर, पूर्ण वित्तीय विवरण के साथ 3 उच्च वेतन वाले करियर विकल्प प्रदान करें:

      प्रत्येक करियर के लिए दें:
      💰 सैलरी की पूरी जानकारी (INR में):
      - शुरुआती सैलरी (नए ग्रेजुएट): ₹XX,XXX प्रति माह
      - 2 साल बाद: ₹XX,XXX प्रति माह
      - 5 साल बाद: ₹XX,XXX प्रति माह
      - सीनियर लेवल (10+ साल): ₹X,XX,XXX प्रति माह
      - अधिकतम कमाई: ₹X,XX,XXX प्रति माह

      🏠 जीवनशैली के फायदे:
      - खरीद सकते हैं: घर/कार/बच्चों की शिक्षा
      - समाज में इज्जत: उच्च/मध्यम
      - नौकरी की सुरक्षा: उच्च/मध्यम/कम

      💼 कंपनी के फायदे:
      - ₹X लाख का मेडिकल इंश्योरेंस
      - प्रोविडेंट फंड (PF)
      - सालाना बोनस: X महीने की सैलरी
      - मुफ्त ट्रेनिंग ₹X लाख की

      📚 पढ़ाई का रास्ता:
      - जरूरी डिग्री/डिप्लोमा
      - समय: X साल
      - पढ़ाई की लागत: ₹X लाख
      - ROI: X साल में पढ़ाई का पैसा वापस

      🎓 मुफ्त स्कॉलरशिप:
      - सरकारी योजनाएं (PM Scholarship आदि)
      - आवेदन कैसे करें

      🏢 टॉप कंपनियां:
      - सबसे ज्यादा सैलरी देने वाली कंपनियां
      - वे कितनी सैलरी देती हैं

      🌍 विदेश में नौकरी:
      - कौन से देश में ज्यादा मांग
      - विदेशी सैलरी (INR में)

      इमोजी और स्पष्ट सेक्शन के साथ फॉर्मेट करें। माता-पिता को समझाएं कि यह उनके बच्चों के लिए समृद्धि और वित्तीय स्वतंत्रता का रास्ता है।`,
      askAnything: '💬 पैसे और करियर के बारे में पूछें',
      generatePath: '💰 अच्छी सैलरी वाले करियर दिखाएं',
      creating: '💰 अच्छे करियर खोजे जा रहे हैं...',
      thinking: '💭 कमाई की संभावना देख रहे हैं...',
      ask: 'पूछें',
      selectAtLeastOne: '⚠️ कमाई के अवसर देखने के लिए कम से कम एक रुचि चुनें!'
    },
    'ta': {
      askPlaceholder: 'தொழில் மற்றும் பணத்தைப் பற்றி எதையும் கேளுங்கள்! எளிமையாக விளக்குகிறேன்...',
      dreamPathTitle: '💰 அதிக சம்பளம் தரும் தொழில்கள்',
      selectInterests: '🎯 நல்ல சம்பளம் தரும் தொழில்களை அறிய ஆர்வங்களை தேர்ந்தெடுக்கவும்:',
      explainSimply: 'இதை ஒரு குழந்தை புரிந்துகொள்ளக்கூடிய மிக எளிய வார்த்தைகளில் விளக்கவும்',
      careerGuidance: `இந்த ஆர்வங்களின் அடிப்படையில், முழுமையான நிதி விவரங்களுடன் 3 அதிக வருமானம் தரும் தொழில் விருப்பங்களை வழங்கவும்:

      ஒவ்வொரு தொழிலுக்கும் கொடுக்கவும்:
      💰 சம்பள விவரங்கள் (INR இல்):
      - ஆரம்ப சம்பளம் (புதிய பட்டதாரி): மாதம் ₹XX,XXX
      - 2 வருடங்கள் கழித்து: மாதம் ₹XX,XXX  
      - 5 வருடங்கள் கழித்து: மாதம் ₹XX,XXX
      - மூத்த நிலை (10+ வருடங்கள்): மாதம் ₹X,XX,XXX
      - அதிகபட்ச வருமானம்: மாதம் ₹X,XX,XXX

      🏠 வாழ்க்கை முறை நன்மைகள்:
      - வாங்க முடியும்: வீடு/கார்/குழந்தைகளின் கல்வி
      - சமூக அந்தஸ்து: உயர்/நடுத்தர மரியாதை
      - வேலை பாதுகாப்பு: அதிக/நடுத்தர/குறைந்த

      💼 நிறுவன நன்மைகள்:
      - ₹X லட்சம் மதிப்பிலான மருத்துவ காப்பீடு
      - சேமநல நிதி (PF) பங்களிப்பு
      - வருடாந்திர போனஸ்: X மாத சம்பளம்
      - இலவச பயிற்சி ₹X லட்சம் மதிப்பு

      📚 கல்விப் பாதை:
      - தேவையான பட்டம்/டிப்ளோமா
      - காலம்: X ஆண்டுகள்
      - கல்வி செலவு: ₹X லட்சம்
      - ROI: X வருடங்களில் கல்வி செலவு திரும்பும்

      🎓 இலவச உதவித்தொகைகள்:
      - அரசு திட்டங்கள் (PM Scholarship போன்றவை)
      - விண்ணப்பிக்கும் முறை

      🏢 சிறந்த நிறுவனங்கள்:
      - அதிக சம்பளம் தரும் நிறுவனங்கள்
      - அவை தரும் தொடக்க சம்பளம்

      🌍 வெளிநாட்டு வாய்ப்புகள்:
      - அதிக தேவையுள்ள நாடுகள்
      - வெளிநாட்டு சம்பளம் (INR இல்)

      எமோஜி மற்றும் தெளிவான பிரிவுகளுடன் வடிவமைக்கவும். பெற்றோருக்கு இது அவர்களின் குழந்தைகளுக்கு செல்வம் மற்றும் நிதி சுதந்திரத்தின் பாதை என்று புரியவைக்கவும்.`,
      askAnything: '💬 பணம் மற்றும் தொழில் பற்றி கேளுங்கள்',
      generatePath: '💰 அதிக சம்பள தொழில்களைக் காட்டு',
      creating: '💰 அதிக வருமான தொழில்களைக் கண்டறிகிறோம்...',
      thinking: '💭 சம்பாதிக்கும் திறனைக் கணக்கிடுகிறோம்...',
      ask: 'கேள்',
      selectAtLeastOne: '⚠️ சம்பாதிக்கும் வாய்ப்புகளைப் பார்க்க குறைந்தபட்சம் ஒரு ஆர்வத்தைத் தேர்ந்தெடுக்கவும்!'
    }
  };

  // Language Picker Component
  const LanguagePicker = () => {
    const [showPicker, setShowPicker] = useState(false);
    
    return (
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>🌍 भाषा | Language | மொழி:</Text>
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
            maxOutputTokens: isCareerGuidance ? 3000 : 1024,
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
    const prompt = `${prompts.explainSimply}: "${question}". Focus on practical benefits and earning opportunities. Please respond in ${languages[selectedLanguage]} language.`;
    
    const response = await callGeminiAPI(prompt);
    
    const aiMessage = { type: 'ai', text: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMessage]);
    setQuestion('');
    setIsLoading(false);
  };

  const generateDreamPath = async () => {
    if (interests.length === 0) {
      const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];
      Alert.alert('💰 Missing Information', prompts.selectAtLeastOne);
      return;
    }

    setIsLoading(true);
    const prompts = languagePrompts[selectedLanguage] || languagePrompts['en'];
    const prompt = `${prompts.careerGuidance} Selected interests: [${interests.join(', ')}]. Please respond in ${languages[selectedLanguage]} language.`;
    
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
          <Text style={styles.title}>💰 AI Mentor</Text>
          <Text style={styles.subtitle}>
            🚀 Your guide to HIGH-PAYING careers and FINANCIAL SUCCESS! 💎
          </Text>
          <View style={styles.moneyBadge}>
            <Text style={styles.moneyBadgeText}>💵 Discover careers that pay ₹50,000 - ₹5,00,000+ per month! 💵</Text>
          </View>
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
              {prompts.askAnything}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dream' && styles.activeTab]}
            onPress={() => setActiveTab('dream')}
          >
            <Text style={[styles.tabText, activeTab === 'dream' && styles.activeTabText]}>
              💰 Career Paths
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ask Me Anything Tab */}
        {activeTab === 'ask' && (
          <View style={styles.tabContent}>
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                
              </View>
              <TextInput
                style={styles.textInput}
                value={question}
                onChangeText={setQuestion}
                placeholder={prompts.askPlaceholder}
                placeholderTextColor="#666"
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
                  <Text style={styles.sendButtonText}>💫 {prompts.ask}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    👋 Hi! Ask me about careers that can make you RICH! 💰
                    {'\n\n'}Examples:
                    {'\n'}• "Which engineering job pays the most?"
                    {'\n'}• "How much do doctors earn?"
                    {'\n'}• "Best business careers for money?"
                  </Text>
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
                          { color: message.type === 'user' ? '#ffffff' : '#1F2937' }
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
                          <ActivityIndicator color="#059669" style={{ marginLeft: 8 }} />
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
            <Text style={styles.dreamPathTitle}>💎 {prompts.dreamPathTitle}</Text>
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
                    {interests.includes(interest) ? '✓ ' : ''}💼 {interest}
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
                  💰 {prompts.generatePath}
                </Text>
              )}
            </TouchableOpacity>

            {dreamPathResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>💰 YOUR CAREER BLUEPRINT</Text>
                <View style={styles.salaryHighlight}>
                  <Text style={styles.salaryHighlightText}>
                    🎯 Potential Monthly Earnings: ₹50,000 - ₹5,00,000+
                  </Text>
                </View>
                <ScrollView style={styles.resultScroll} nestedScrollEnabled={true}>
                  <View style={styles.colorfulResultContainer}>
                    <Text style={styles.resultText}>{dreamPathResult}</Text>
                  </View>
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
    backgroundColor: '#F0FDF4',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#047857',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  moneyBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  moneyBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
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
    color: '#065F46',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 180,
    justifyContent: 'space-between',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  languageButtonText: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#059669',
    fontWeight: 'bold',
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
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#047857',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
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