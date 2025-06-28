"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Mail,
  Settings,
  Heart,
  Plus,
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

const FuzzleApp = ({
  darkMode,
  setDarkMode,
}: { darkMode: boolean; setDarkMode: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddWordDialog, setShowAddWordDialog] = useState(false)

  const [dyslexiaSettings, setDyslexiaSettings] = useState<DyslexiaSettings>({
    lineHeight: 1.6,
    letterSpacing: 0.05,
    fontSize: 18,
    syllableMode: false,
  })

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([
    {
      id: "1",
      word: "magnificent",
      phonetic: "mag-NIF-i-sent",
      definition: "Very beautiful or impressive",
      sentence: "The sunset was magnificent with bright orange colors.",
      imageEmoji: "🌅",
      difficulty: "hard",
    },
    {
      id: "2",
      word: "adventure",
      phonetic: "ad-VEN-cher",
      definition: "An exciting journey or experience",
      sentence: "Going camping was a real adventure for the kids.",
      imageEmoji: "🏕️",
      difficulty: "medium",
    },
  ])

  const [hoveredWord, setHoveredWord] = useState<WordDefinition | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Add word form state
  const [newWord, setNewWord] = useState({
    word: "",
    definition: "",
    sentence: "",
    emoji: "📚",
    difficulty: "medium" as "easy" | "medium" | "hard",
  })

  const speechSynthesis = typeof window !== "undefined" ? window.speechSynthesis : null
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const [inputText, setInputText] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [originalText, setOriginalText] = useState("")

  // Sample text for demonstration
  useEffect(() => {
    const sampleText =
      "Reading comprehension involves understanding written language through various cognitive processes. Dyslexic individuals often experience difficulties with phonological processing, which affects their ability to decode words efficiently. However, with appropriate accommodations and assistive technologies, these challenges can be significantly reduced."
    setInputText(sampleText)
    setDisplayText(sampleText)
    setOriginalText(sampleText)
  }, [])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

    // Dictionary definitions for common hard words
    const wordDefinitions: {
      [key: string]: { definition: string; sentence: string; emoji: string; difficulty: "easy" | "medium" | "hard" }
    } = {
      comprehension: {
        definition: "The ability to understand something completely",
        sentence: "Her reading comprehension improved after using the new techniques.",
        emoji: "🧠",
        difficulty: "medium",
      },
      cognitive: {
        definition: "Related to thinking, understanding, learning, and remembering",
        sentence: "Cognitive skills help us process information effectively.",
        emoji: "💭",
        difficulty: "hard",
      },
      phonological: {
        definition: "Related to the sounds and pronunciation of language",
        sentence: "Phonological awareness is important for reading development.",
        emoji: "🔊",
        difficulty: "hard",
      },
      accommodations: {
        definition: "Special arrangements made to help someone succeed",
        sentence: "The school provided accommodations for students with learning differences.",
        emoji: "🤝",
        difficulty: "medium",
      },
      assistive: {
        definition: "Designed to help or support someone",
        sentence: "Assistive technology makes learning easier for many students.",
        emoji: "🛠️",
        difficulty: "medium",
      },
      efficiently: {
        definition: "In a way that achieves maximum productivity with minimum effort",
        sentence: "She completed her homework efficiently using the new study method.",
        emoji: "⚡",
        difficulty: "medium",
      },
      significantly: {
        definition: "In a way that is important or noticeable",
        sentence: "His reading speed improved significantly after practice.",
        emoji: "📈",
        difficulty: "medium",
      },
      technologies: {
        definition: "Tools, machines, or systems that help solve problems",
        sentence: "New technologies are making education more accessible.",
        emoji: "💻",
        difficulty: "easy",
      },
      difficulties: {
        definition: "Problems or challenges that make something hard to do",
        sentence: "Many students face difficulties when learning to read.",
        emoji: "⚠️",
        difficulty: "easy",
      },
      individuals: {
        definition: "Single persons, considered separately from a group",
        sentence: "Each individual learns at their own pace.",
        emoji: "👤",
        difficulty: "medium",
      },
    }

    const newWords: VocabularyWord[] = hardWords.slice(0, 3).map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "")
      const wordData = wordDefinitions[cleanWord]

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

  const handleAddWord = () => {
    if (newWord.word.trim() && newWord.definition.trim()) {
      const wordToAdd: VocabularyWord = {
        id: Date.now().toString(),
        word: newWord.word.toLowerCase().trim(),
        phonetic: splitIntoSyllables(newWord.word.toLowerCase().trim()),
        definition: newWord.definition.trim(),
        sentence: newWord.sentence.trim() || `Here's an example: "${newWord.word}" is used in sentences.`,
        imageEmoji: newWord.emoji,
        difficulty: newWord.difficulty,
      }

      setVocabulary((prev) => [...prev, wordToAdd])
      setNewWord({
        word: "",
        definition: "",
        sentence: "",
        emoji: "📚",
        difficulty: "medium",
      })
      setShowAddWordDialog(false)
    }
  }

  // Get word definition for hover
  const getWordDefinition = (word: string): WordDefinition | null => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "")

    const definitions: { [key: string]: WordDefinition } = {
      comprehension: {
        word: "comprehension",
        definition: "The ability to understand something",
        phonetic: "com-pre-HEN-sion",
        example: "Reading comprehension improved with practice.",
      },
      cognitive: {
        word: "cognitive",
        definition: "Related to thinking and mental processes",
        phonetic: "COG-ni-tive",
        example: "Cognitive skills help us learn new things.",
      },
      phonological: {
        word: "phonological",
        definition: "Related to the sounds of language",
        phonetic: "pho-no-LOG-i-cal",
        example: "Phonological awareness helps with reading.",
      },
      accommodations: {
        word: "accommodations",
        definition: "Changes made to help someone succeed",
        phonetic: "ac-com-mo-DA-tions",
        example: "The student received accommodations for the test.",
      },
      assistive: {
        word: "assistive",
        definition: "Designed to help or support",
        phonetic: "as-SIS-tive",
        example: "Assistive technology helps people with disabilities.",
      },
    }

    return definitions[cleanWord] || null
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

  const handleTextChange = (newText: string) => {
    setInputText(newText)
    setDisplayText(newText)
    setOriginalText(newText)
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
        handleTextChange(content)
      }
      reader.readAsText(file)
    }
  }

  const dyslexiaFontClass = isDyslexiaMode ? "font-opendyslexic" : ""

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white"
            : "bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b-4 border-blue-200 dark:border-blue-700 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${dyslexiaFontClass}`}
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
            <Card className="shadow-2xl border-4 border-blue-200 dark:border-blue-700 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 pb-4">
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Your Reading Text
                  {isDyslexiaMode && <Badge className="bg-green-500 text-white">Dyslexia Mode</Badge>}
                  {dyslexiaSettings.syllableMode && <Badge className="bg-orange-500 text-white">Syllable Mode</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Text Display/Edit Area */}
                <div className="space-y-4">
                  <Textarea
                    value={displayText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className={`min-h-[300px] text-lg rounded-2xl border-4 border-blue-200 dark:border-blue-700 ${dyslexiaFontClass} resize-none`}
                    style={{
                      lineHeight: dyslexiaSettings.lineHeight,
                      letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
                      fontSize: `${dyslexiaSettings.fontSize}px`,
                    }}
                  />

                  {/* Reading Display Area */}
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-4 border-dashed border-blue-200 dark:border-blue-700 min-h-[200px] ${dyslexiaFontClass}`}
                  >
                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {renderTextWithFeatures(displayText)}
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="mt-6 p-6 border-4 border-dashed border-yellow-300 dark:border-yellow-600 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              <Card className="shadow-2xl border-4 border-purple-200 dark:border-purple-700 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
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
            <Card className="shadow-2xl border-4 border-green-200 dark:border-green-700 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <span className="text-2xl">🛠️</span>
                  Reading Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                        className="h-20 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold"
                      >
                        <Bookmark className="w-8 h-8 mr-3" />
                        <span className={dyslexiaFontClass}>📌 Find Hard Words</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Find and save difficult words to your vocabulary</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowAddWordDialog(true)}
                        size="lg"
                        className="h-20 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-bold"
                      >
                        <Plus className="w-8 h-8 mr-3" />
                        <span className={dyslexiaFontClass}>➕ Add My Word</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add your own difficult words to vocabulary</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vocabulary Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-4 border-purple-200 dark:border-purple-700 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <CardTitle className={`text-xl flex items-center gap-3 ${dyslexiaFontClass}`}>
                  <Bookmark className="w-6 h-6 text-purple-600" />
                  My Vocabulary ({vocabulary.length} words)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                {vocabulary.map((word) => (
                  <Card
                    key={word.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{word.imageEmoji}</span>
                          <div>
                            <h4 className={`font-bold text-xl text-gray-800 dark:text-gray-200 ${dyslexiaFontClass}`}>
                              {word.word}
                            </h4>
                            <p className={`text-sm text-gray-600 dark:text-gray-400 font-mono ${dyslexiaFontClass}`}>
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
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl">
                          <span className={`font-semibold text-blue-600 dark:text-blue-400 ${dyslexiaFontClass}`}>
                            Definition:
                          </span>
                          <p
                            className={`text-gray-700 dark:text-gray-300 mt-1 ${dyslexiaFontClass}`}
                            style={{
                              lineHeight: dyslexiaSettings.lineHeight,
                              letterSpacing: `${dyslexiaSettings.letterSpacing}em`,
                            }}
                          >
                            {word.definition}
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                          <span className={`font-semibold text-green-600 dark:text-green-400 ${dyslexiaFontClass}`}>
                            Example:
                          </span>
                          <p
                            className={`text-gray-700 dark:text-gray-300 mt-1 italic ${dyslexiaFontClass}`}
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
                    <p className={`text-gray-500 dark:text-gray-400 ${dyslexiaFontClass}`}>
                      No words bookmarked yet. Use the "Find Hard Words" or "Add My Word" buttons to add some!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Word Dialog */}
        <Dialog open={showAddWordDialog} onOpenChange={setShowAddWordDialog}>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className={`text-2xl text-center ${dyslexiaFontClass}`}>➕ Add My Word</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>Word</Label>
                  <Input
                    value={newWord.word}
                    onChange={(e) => setNewWord((prev) => ({ ...prev, word: e.target.value }))}
                    placeholder="Enter the difficult word"
                    className={`mt-2 ${dyslexiaFontClass}`}
                  />
                </div>

                <div>
                  <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>Emoji</Label>
                  <Input
                    value={newWord.emoji}
                    onChange={(e) => setNewWord((prev) => ({ ...prev, emoji: e.target.value }))}
                    placeholder="📚"
                    className={`mt-2 ${dyslexiaFontClass}`}
                  />
                </div>
              </div>

              <div>
                <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>Definition</Label>
                <Textarea
                  value={newWord.definition}
                  onChange={(e) => setNewWord((prev) => ({ ...prev, definition: e.target.value }))}
                  placeholder="What does this word mean?"
                  className={`mt-2 ${dyslexiaFontClass}`}
                />
              </div>

              <div>
                <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>Example Sentence</Label>
                <Textarea
                  value={newWord.sentence}
                  onChange={(e) => setNewWord((prev) => ({ ...prev, sentence: e.target.value }))}
                  placeholder="Use the word in a sentence"
                  className={`mt-2 ${dyslexiaFontClass}`}
                />
              </div>

              <div>
                <Label className={`text-sm font-medium ${dyslexiaFontClass}`}>Difficulty</Label>
                <div className="flex gap-2 mt-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <Button
                      key={level}
                      onClick={() => setNewWord((prev) => ({ ...prev, difficulty: level }))}
                      variant={newWord.difficulty === level ? "default" : "outline"}
                      className={`capitalize ${dyslexiaFontClass}`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setShowAddWordDialog(false)} className={dyslexiaFontClass}>
                  Cancel
                </Button>
                <Button onClick={handleAddWord} className={dyslexiaFontClass}>
                  Add Word
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Word Definition Tooltip */}
        {hoveredWord && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-2xl max-w-sm"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
            }}
          >
            <div className="space-y-2">
              <h4 className={`font-bold text-lg text-blue-600 dark:text-blue-400 ${dyslexiaFontClass}`}>
                {hoveredWord.word}
              </h4>
              <p className={`text-sm text-gray-600 dark:text-gray-400 font-mono ${dyslexiaFontClass}`}>
                {hoveredWord.phonetic}
              </p>
              <p className={`text-gray-700 dark:text-gray-300 ${dyslexiaFontClass}`}>{hoveredWord.definition}</p>
              <p className={`text-sm text-gray-600 dark:text-gray-400 italic ${dyslexiaFontClass}`}>
                "{hoveredWord.example}"
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-t-4 border-blue-200 dark:border-blue-700">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className={`text-2xl font-bold mb-4 ${dyslexiaFontClass}`}>About Fuzzle</h3>
                <p
                  className={`text-gray-700 dark:text-gray-300 ${dyslexiaFontClass}`}
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
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className={`text-sm text-gray-600 dark:text-gray-400 ${dyslexiaFontClass}`}>
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

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [showApp, setShowApp] = useState(false)

  const handleStartReading = () => {
    setShowApp(true)
    // Scroll to top after state change
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }

  if (showApp) {
    return <FuzzleApp darkMode={darkMode} setDarkMode={setDarkMode} />
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
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
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

        {/* Welcome Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Welcome to Fuzzle!
            </h1>
            <p className={`text-xl md:text-2xl mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Your Friendly Reading Assistant
            </p>
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Making reading fun, easy, and accessible for everyone! 📚✨
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card
              className={`shadow-2xl border-4 rounded-3xl overflow-hidden transition-all hover:scale-105 ${
                darkMode
                  ? "border-blue-700 bg-gradient-to-br from-blue-900/50 to-cyan-900/50"
                  : "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50"
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Smart Reading Helper</h3>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  I make hard words easier and help you understand any text better!
                </p>
              </CardContent>
            </Card>

            <Card
              className={`shadow-2xl border-4 rounded-3xl overflow-hidden transition-all hover:scale-105 ${
                darkMode
                  ? "border-pink-700 bg-gradient-to-br from-pink-900/50 to-purple-900/50"
                  : "border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50"
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">💖</div>
                <h3 className="text-2xl font-bold mb-4 text-pink-600 dark:text-pink-400">Dyslexia Friendly</h3>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Special fonts, colors, and spacing to make reading comfortable for everyone!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feature Section */}
          <Card
            className={`shadow-2xl border-4 rounded-3xl overflow-hidden mb-16 ${
              darkMode
                ? "border-purple-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
                : "border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50"
            }`}
          >
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">📖</div>
                    <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Smart Reading Helper</h2>
                  </div>
                  <p className={`text-xl mb-8 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    I make hard words easier and help you understand any text better!
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⚡</div>
                      <span className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Simplify difficult words instantly
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🔊</div>
                      <span className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Read aloud with friendly voice
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <span className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Upload PDFs and text files
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartReading}
                    size="lg"
                    className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-xl px-8 py-4"
                  >
                    ▶️ Start Reading
                  </Button>
                </div>

                <div
                  className={`rounded-2xl p-8 flex items-center justify-center ${
                    darkMode ? "bg-blue-900/20" : "bg-blue-100"
                  }`}
                >
                  <div className="text-8xl">📚</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className={`border-t-4 pt-8 ${darkMode ? "border-purple-700" : "border-purple-200"}`}>
            <div className="text-center">
              <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Made with <Heart className="w-5 h-5 inline text-red-500" /> for better reading
              </p>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}
