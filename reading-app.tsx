"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Upload,
  Brain,
  Type,
  Volume2,
  Bookmark,
  Moon,
  Sun,
  Pause,
  X,
  Info,
  Mail,
  Settings,
  ArrowLeft,
} from "lucide-react"

interface VocabularyWord {
  id: string
  word: string
  phonetic: string
  definition: string
  sentence: string
  imageEmoji: string
  difficulty: "easy" | "medium" | "hard"
}

interface DyslexiaSettings {
  lineHeight: number
  letterSpacing: number
  fontSize: number
  syllableMode: boolean
}

interface WordDefinition {
  word: string
  definition: string
  phonetic: string
  example: string
}

interface FuzzleAppProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

export default function FuzzleApp({ darkMode, setDarkMode }: FuzzleAppProps) {
  const [inputText, setInputText] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [showSettings, setShowSettings] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const [dyslexiaSettings, setDyslexiaSettings] = useState<DyslexiaSettings>({
    lineHeight: 1.6,
    letterSpacing: 0.05,
    fontSize: 18,
    syllableMode: false,
  })

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([])

  const [hoveredWord, setHoveredWord] = useState<WordDefinition | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const speechSynthesis = typeof window !== "undefined" ? window.speechSynthesis : null
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Sample text for demonstration
  useEffect(() => {
    const sampleText =
      "Reading comprehension involves understanding written language through various cognitive processes. Dyslexic individuals often experience difficulties with phonological processing, which affects their ability to decode words efficiently. However, with appropriate accommodations and assistive technologies, these challenges can be significantly reduced."
    setInputText(sampleText)
    setDisplayText(sampleText)
  }, [])

  // Dictionary with proper definitions and examples
  const wordDictionary: {
    [key: string]: { definition: string; sentence: string; emoji: string; difficulty: "easy" | "medium" | "hard" }
  } = {
    comprehension: {
      definition: "The ability to understand the meaning of something",
      sentence: "Her reading comprehension improved after practicing with different texts.",
      emoji: "🧠",
      difficulty: "medium",
    },
    cognitive: {
      definition: "Related to the mental processes of thinking, learning, and understanding",
      sentence: "Cognitive development is important for academic success.",
      emoji: "💭",
      difficulty: "hard",
    },
    phonological: {
      definition: "Related to the sounds and pronunciation patterns of language",
      sentence: "Phonological awareness helps children learn to read more effectively.",
      emoji: "🔊",
      difficulty: "hard",
    },
    accommodations: {
      definition: "Special arrangements or modifications made to help someone succeed",
      sentence: "The teacher provided accommodations to help students with learning differences.",
      emoji: "🤝",
      difficulty: "medium",
    },
    assistive: {
      definition: "Designed to help or support someone in accomplishing a task",
      sentence: "Assistive technology can make learning more accessible for all students.",
      emoji: "🛠️",
      difficulty: "medium",
    },
    efficiently: {
      definition: "In a way that achieves maximum results with minimum effort or waste",
      sentence: "She completed her homework efficiently by using good study strategies.",
      emoji: "⚡",
      difficulty: "medium",
    },
    significantly: {
      definition: "In a way that is large enough to be important or noticeable",
      sentence: "His reading speed improved significantly after using the new method.",
      emoji: "📈",
      difficulty: "medium",
    },
    technologies: {
      definition: "Tools, machines, or systems that help solve problems or make tasks easier",
      sentence: "Educational technologies are transforming how students learn.",
      emoji: "💻",
      difficulty: "easy",
    },
    difficulties: {
      definition: "Problems or challenges that make something hard to accomplish",
      sentence: "Many students overcome reading difficulties with proper support.",
      emoji: "⚠️",
      difficulty: "easy",
    },
    individuals: {
      definition: "Single persons considered separately from a group",
      sentence: "Each individual has their own unique learning style.",
      emoji: "👤",
      difficulty: "medium",
    },
    processes: {
      definition: "Series of actions or steps taken to achieve a particular result",
      sentence: "Learning involves many different mental processes working together.",
      emoji: "⚙️",
      difficulty: "medium",
    },
    appropriate: {
      definition: "Suitable or proper for a particular situation or purpose",
      sentence: "It's important to choose appropriate reading materials for each student.",
      emoji: "✅",
      difficulty: "medium",
    },
  }

  // Syllable splitting function
  const splitIntoSyllables = (word: string): string => {
    const vowels = "aeiouyAEIOUY"
    const syllables: string[] = []
    let currentSyllable = ""

    for (let i = 0; i < word.length; i++) {
      currentSyllable += word[i]

      if (vowels.includes(word[i]) && i < word.length - 1) {
        if (!vowels.includes(word[i + 1])) {
          if (i < word.length - 2 && !vowels.includes(word[i + 2])) {
            currentSyllable += word[i + 1]
            i++
          }
          syllables.push(currentSyllable)
          currentSyllable = ""
        }
      }
    }

    if (currentSyllable) {
      syllables.push(currentSyllable)
    }

    return syllables.join("-")
  }

  // Enhanced text simplification
  const simplifyText = async (text: string): Promise<string> => {
    const simplifications: { [key: string]: string } = {
      comprehension: "understanding",
      cognitive: "thinking",
      processes: "steps",
      individuals: "people",
      experience: "have",
      difficulties: "problems",
      phonological: "sound-based",
      processing: "handling",
      affects: "changes",
      ability: "skill",
      decode: "read",
      efficiently: "well",
      appropriate: "right",
      accommodations: "help",
      assistive: "helpful",
      technologies: "tools",
      challenges: "problems",
      significantly: "a lot",
      reduced: "made smaller",
      various: "different",
      however: "but",
    }

    let simplified = text
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, "gi")
      simplified = simplified.replace(regex, simple)
    })

    return simplified
  }

  const handleSimplifyText = async () => {
    if (inputText.trim()) {
      const simplified = await simplifyText(inputText)
      setDisplayText(simplified)
    }
  }

  const restoreOriginalText = () => {
    setDisplayText(inputText)
  }

  const toggleDyslexiaMode = () => {
    setIsDyslexiaMode(!isDyslexiaMode)
    setShowSettings(!showSettings)
  }

  const startReading = () => {
    if (!speechSynthesis || !displayText.trim()) return

    const words = displayText.split(/\s+/)
    let currentIndex = 0
    setIsReading(true)
    setCurrentWordIndex(0)

    const readNextWord = () => {
      if (currentIndex >= words.length) {
        setIsReading(false)
        setCurrentWordIndex(-1)
        return
      }

      const word = words[currentIndex]
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.6
      utterance.pitch = 1.1
      utterance.volume = 0.9

      setCurrentWordIndex(currentIndex)

      utterance.onend = () => {
        currentIndex++
        setTimeout(readNextWord, 400)
      }

      speechSynthesis.speak(utterance)
    }

    readNextWord()
  }

  const stopReading = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
    }
    setIsReading(false)
    setCurrentWordIndex(-1)
  }

  const bookmarkWords = () => {
    const words = displayText.split(/\s+/)
    const hardWords = words.filter(
      (word) => word.length > 6 && !vocabulary.find((v) => v.word.toLowerCase() === word.toLowerCase()),
    )

    const newWords: VocabularyWord[] = hardWords.slice(0, 3).map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "")
      const wordData = wordDictionary[cleanWord]

      if (wordData) {
        return {
          id: Date.now().toString() + index,
          word: cleanWord,
          phonetic: splitIntoSyllables(cleanWord),
          definition: wordData.definition,
          sentence: wordData.sentence,
          imageEmoji: wordData.emoji,
          difficulty: wordData.difficulty,
        }
      } else {
        return {
          id: Date.now().toString() + index,
          word: cleanWord,
          phonetic: splitIntoSyllables(cleanWord),
          definition: `A word that appears in the text`,
          sentence: `The word "${cleanWord}" is used in this context.`,
          imageEmoji: ["📚", "🎯", "⭐", "🌟", "💡"][index % 5],
          difficulty: word.length > 8 ? "hard" : "medium",
        }
      }
    })

    setVocabulary((prev) => [...prev, ...newWords])
  }

  const removeWord = (id: string) => {
    setVocabulary((prev) => prev.filter((word) => word.id !== id))
  }

  // Get word definition for hover
  const getWordDefinition = (word: string): WordDefinition | null => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "")
    const wordData = wordDictionary[cleanWord]

    if (wordData) {
      return {
        word: cleanWord,
        definition: wordData.definition,
        phonetic: splitIntoSyllables(cleanWord),
        example: wordData.sentence,
      }
    }

    return null
  }

  const handleWordHover = (word: string, event: React.MouseEvent) => {
    const definition = getWordDefinition(word)
    if (definition) {
      setHoveredWord(definition)
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleWordLeave = () => {
    setHoveredWord(null)
  }

  const renderTextWithFeatures = (text: string) => {
    const lines = text.split("\n")

    return lines.map((line, lineIndex) => {
      const words = line.split(/\s+/)

      return (
        <div
          key={lineIndex}
          className="transition-all duration-300 opacity-100"
          style={{
            lineHeight: dyslexiaSettings.lineHeight,
            letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
            fontSize: `${dyslexiaSettings.fontSize}px`,
          }}
        >
          {words.map((word, wordIndex) => {
            const globalWordIndex =
              lines.slice(0, lineIndex).reduce((acc, l) => acc + l.split(/\s+/).length, 0) + wordIndex
            const isHighlighted = isReading && globalWordIndex === currentWordIndex
            const displayWord = dyslexiaSettings.syllableMode && word.length > 4 ? splitIntoSyllables(word) : word

            return (
              <span
                key={`${lineIndex}-${wordIndex}`}
                className={`inline-block cursor-pointer transition-all duration-200 ${
                  isHighlighted
                    ? "bg-yellow-300 dark:bg-yellow-600 px-2 py-1 rounded-lg animate-pulse shadow-lg scale-110"
                    : "hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
                }`}
                onMouseEnter={(e) => handleWordHover(word, e)}
                onMouseLeave={handleWordLeave}
              >
                {displayWord}
                {wordIndex < words.length - 1 ? " " : ""}
              </span>
            )
          })}
        </div>
      )
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
        setDisplayText(content)
      }
      reader.readAsText(file)
    }
  }

  const dyslexiaFontClass = isDyslexiaMode ? "font-opendyslexic" : ""

  if (showWelcome) {
    return <div>Welcome Page</div>
  }

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white"
            : "bg-gradient-to-br from-purple-50 via-blue-50 to-green-50"
        }`}
      >
        {/* Header */}
        <header
          className={`sticky top-0 z-50 backdrop-blur-md border-b-4 shadow-lg ${
            darkMode ? "bg-gray-900/80 border-purple-700" : "bg-white/80 border-purple-200"
          }`}
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowWelcome(true)} className="rounded-full p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent ${dyslexiaFontClass}`}
              >
                Fuzzle – Reading Made Friendly
              </h1>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
                >
                  {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {darkMode ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div className="container mx-auto p-4 md:p-6 grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Text Input Area */}
            <Card
              className={`shadow-2xl border-4 rounded-3xl overflow-hidden ${
                darkMode ? "border-purple-700 bg-gray-800/50" : "border-purple-200 bg-white"
              }`}
            >
              <CardHeader
                className={`pb-4 ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-900 to-blue-900"
                    : "bg-gradient-to-r from-purple-100 to-blue-100"
                }`}
              >
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Your Reading Text
                  {isDyslexiaMode && <Badge className="bg-green-500 text-white">Dyslexia Mode</Badge>}
                  {dyslexiaSettings.syllableMode && <Badge className="bg-orange-500 text-white">Syllable Mode</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Text Display Area */}
                <div
                  className={`rounded-2xl p-6 border-4 border-dashed min-h-[300px] relative ${dyslexiaFontClass} ${
                    darkMode ? "border-purple-700 bg-gray-900/50" : "border-purple-200 bg-purple-50"
                  }`}
                >
                  <div className={`${darkMode ? "text-gray-200" : "text-gray-800"} whitespace-pre-wrap`}>
                    {renderTextWithFeatures(displayText)}
                  </div>
                </div>

                {/* Text Input Area */}
                <div className="mt-6">
                  <Label className={`text-sm font-medium mb-2 block ${dyslexiaFontClass}`}>
                    Type or paste your text here:
                  </Label>
                  <Textarea
                    ref={textAreaRef}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value)
                      setDisplayText(e.target.value)
                    }}
                    placeholder="Paste or type your text here..."
                    className={`min-h-[120px] text-lg rounded-2xl border-4 ${dyslexiaFontClass} ${
                      darkMode ? "border-purple-700 bg-gray-800 text-white" : "border-purple-200 bg-white"
                    }`}
                  />
                </div>

                {/* File Upload */}
                <div
                  className={`mt-6 p-6 border-4 border-dashed rounded-2xl ${
                    darkMode ? "border-yellow-600 bg-yellow-900/20" : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center gap-3 cursor-pointer transition-colors ${
                      darkMode ? "text-gray-300 hover:text-yellow-400" : "text-gray-700 hover:text-yellow-600"
                    }`}
                  >
                    <Upload className="w-8 h-8" />
                    <span className={`text-lg font-semibold ${dyslexiaFontClass}`}>Upload Text File (PDF/TXT)</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dyslexia Settings Panel */}
            {showSettings && (
              <Card
                className={`shadow-2xl border-4 rounded-3xl overflow-hidden ${
                  darkMode ? "border-purple-700 bg-gray-800/50" : "border-purple-200 bg-white"
                }`}
              >
                <CardHeader
                  className={`${
                    darkMode
                      ? "bg-gradient-to-r from-purple-900 to-pink-900"
                      : "bg-gradient-to-r from-purple-100 to-pink-100"
                  }`}
                >
                  <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                    <Settings className="w-6 h-6 text-purple-600" />
                    Dyslexia Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>
                          Line Height: {dyslexiaSettings.lineHeight}
                        </Label>
                        <Slider
                          value={[dyslexiaSettings.lineHeight]}
                          onValueChange={([value]) => setDyslexiaSettings((prev) => ({ ...prev, lineHeight: value }))}
                          min={1.2}
                          max={3.0}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>
                          Letter Spacing: {dyslexiaSettings.letterSpacing}em
                        </Label>
                        <Slider
                          value={[dyslexiaSettings.letterSpacing]}
                          onValueChange={([value]) =>
                            setDyslexiaSettings((prev) => ({ ...prev, letterSpacing: value }))
                          }
                          min={0}
                          max={0.3}
                          step={0.01}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>
                          Font Size: {dyslexiaSettings.fontSize}px
                        </Label>
                        <Slider
                          value={[dyslexiaSettings.fontSize]}
                          onValueChange={([value]) => setDyslexiaSettings((prev) => ({ ...prev, fontSize: value }))}
                          min={14}
                          max={32}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => setDyslexiaSettings((prev) => ({ ...prev, syllableMode: !prev.syllableMode }))}
                        variant={dyslexiaSettings.syllableMode ? "default" : "outline"}
                        className="w-full h-16 text-lg"
                      >
                        <Type className="w-6 h-6 mr-2" />
                        Syllable Mode {dyslexiaSettings.syllableMode ? "ON" : "OFF"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card
              className={`shadow-2xl border-4 rounded-3xl overflow-hidden ${
                darkMode ? "border-green-700 bg-gray-800/50" : "border-green-200 bg-white"
              }`}
            >
              <CardHeader
                className={`${
                  darkMode
                    ? "bg-gradient-to-r from-green-900 to-blue-900"
                    : "bg-gradient-to-r from-green-100 to-blue-100"
                }`}
              >
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <span className="text-2xl">🛠️</span>
                  Reading Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={restoreOriginalText}
                        size="lg"
                        className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold"
                      >
                        <span className={dyslexiaFontClass}>🔄 Restore Text</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restore the original text</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSimplifyText}
                        size="lg"
                        className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold"
                      >
                        <Brain className="w-8 h-8 mr-3" />
                        <span className={dyslexiaFontClass}>🧠 Simplify Text</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Make the text easier to understand</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleDyslexiaMode}
                        size="lg"
                        className={`h-20 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold ${
                          isDyslexiaMode
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        }`}
                      >
                        <Type className="w-8 h-8 mr-3" />
                        <span className={dyslexiaFontClass}>🔤 Dyslexia Mode</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch to dyslexia-friendly font and spacing</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={isReading ? stopReading : startReading}
                        size="lg"
                        className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold"
                      >
                        {isReading ? (
                          <>
                            <Pause className="w-8 h-8 mr-3" />
                            <span className={dyslexiaFontClass}>⏸️ Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-8 h-8 mr-3" />
                            <span className={dyslexiaFontClass}>🔊 Reading Mode</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Listen to the text being read with word highlighting</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={bookmarkWords}
                        size="lg"
                        className="h-20 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold md:col-span-2"
                      >
                        <Bookmark className="w-8 h-8 mr-3" />
                        <span className={dyslexiaFontClass}>📌 Find Hard Words</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Find and save difficult words to your vocabulary</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vocabulary Sidebar */}
          <div className="space-y-6">
            <Card
              className={`shadow-2xl border-4 rounded-3xl overflow-hidden ${
                darkMode ? "border-purple-700 bg-gray-800/50" : "border-purple-200 bg-white"
              }`}
            >
              <CardHeader
                className={`${
                  darkMode
                    ? "bg-gradient-to-r from-purple-900 to-pink-900"
                    : "bg-gradient-to-r from-purple-100 to-pink-100"
                }`}
              >
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <Bookmark className="w-6 h-6 text-purple-600" />
                  My Vocabulary ({vocabulary.length} words)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                {vocabulary.map((word) => (
                  <Card
                    key={word.id}
                    className={`border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                      darkMode
                        ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700"
                        : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{word.imageEmoji}</span>
                          <div>
                            <h4
                              className={`font-bold text-xl ${dyslexiaFontClass} ${
                                darkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {word.word}
                            </h4>
                            <p
                              className={`text-sm font-mono ${dyslexiaFontClass} ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {word.phonetic}
                            </p>
                            <Badge
                              className={`mt-1 ${
                                word.difficulty === "hard"
                                  ? "bg-red-500"
                                  : word.difficulty === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              } text-white`}
                            >
                              {word.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWord(word.id)}
                          className="text-gray-400 hover:text-red-500 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className={`p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                          <span
                            className={`font-semibold ${dyslexiaFontClass} ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            Definition:
                          </span>
                          <p
                            className={`mt-1 ${dyslexiaFontClass} ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                            style={{
                              lineHeight: dyslexiaSettings.lineHeight,
                              letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
                            }}
                          >
                            {word.definition}
                          </p>
                        </div>

                        <div className={`p-3 rounded-xl ${darkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
                          <span
                            className={`font-semibold ${dyslexiaFontClass} ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            Example:
                          </span>
                          <p
                            className={`mt-1 italic ${dyslexiaFontClass} ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                            style={{
                              lineHeight: dyslexiaSettings.lineHeight,
                              letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
                            }}
                          >
                            "{word.sentence}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {vocabulary.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className={`${dyslexiaFontClass} ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No words bookmarked yet. Use the "Find Hard Words" button to add some!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Word Definition Tooltip */}
        {hoveredWord && (
          <div
            className={`fixed z-50 border-2 rounded-xl p-4 shadow-2xl max-w-sm ${
              darkMode ? "bg-gray-800 border-purple-700" : "bg-white border-purple-200"
            }`}
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
            }}
          >
            <div className="space-y-2">
              <h4
                className={`font-bold text-lg ${dyslexiaFontClass} ${darkMode ? "text-purple-400" : "text-purple-600"}`}
              >
                {hoveredWord.word}
              </h4>
              <p className={`text-sm font-mono ${dyslexiaFontClass} ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {hoveredWord.phonetic}
              </p>
              <p className={`${dyslexiaFontClass} ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {hoveredWord.definition}
              </p>
              <p className={`text-sm italic ${dyslexiaFontClass} ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                "{hoveredWord.example}"
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className={`mt-16 border-t-4 ${
            darkMode
              ? "bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700"
              : "bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200"
          }`}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className={`text-2xl font-bold mb-4 ${dyslexiaFontClass}`}>About Fuzzle</h3>
                <p
                  className={`${dyslexiaFontClass} ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  style={{
                    lineHeight: dyslexiaSettings.lineHeight,
                    letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
                  }}
                >
                  Fuzzle is designed to make reading fun and accessible for everyone, especially learners with dyslexia.
                  Our tools help simplify text, improve comprehension, and build vocabulary in a friendly, supportive
                  environment.
                </p>
              </div>

              <div className="text-center md:text-right">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl shadow-lg hover:shadow-xl transition-all bg-transparent"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  <span className={dyslexiaFontClass}>Contact & Help</span>
                </Button>

                <div className="mt-4 flex items-center justify-center md:justify-end gap-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  <span className={`text-sm ${dyslexiaFontClass} ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Made with ❤️ for better reading
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
