'use client';
import React from 'react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { 
  Brain, 
  Clock, 
  Trophy, 
  CheckCircle, 
  XCircle,
  Star,
  Zap,
  Play,
  RotateCcw,
  Target,
  Award,
  Timer,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  timeLimit: number; // في الدقائق
  points: number;
  category: string;
  icon: string;
  completed?: boolean;
  score?: number;
}

const quizzes: Quiz[] = [
  {
    id: 1,
    title: 'أساسيات البيئة والاستدامة',
    description: 'اختبار بسيط حول المفاهيم الأساسية للبيئة والاستدامة',
    difficulty: 'easy',
    timeLimit: 5,
    points: 50,
    category: 'عام',
    icon: '🌱',
    questions: [
      {
        id: 1,
        question: 'ما هي البصمة الكربونية؟',
        options: [
          'كمية الكربون الموجودة في الجو',
          'إجمالي الغازات الدفيئة المنبعثة من الأنشطة البشرية',
          'نوع من أنواع التلوث',
          'مصطلح يستخدم في الكيمياء فقط'
        ],
        correctAnswer: 1,
        explanation: 'البصمة الكربونية هي إجمالي الغازات الدفيئة المنبعثة مباشرة أو غير مباشرة من الأنشطة البشرية.'
      },
      {
        id: 2,
        question: 'أي من هذه الأنشطة له أكبر أثر على البيئة؟',
        options: [
          'استخدام الكمبيوتر لساعة واحدة',
          'طباعة 100 ورقة',
          'السفر بالطائرة لمسافة 1000 كم',
          'شرب كوب من القهوة'
        ],
        correctAnswer: 2,
        explanation: 'السفر بالطائرة له أكبر أثر على البيئة بسبب الانبعاثات العالية للوقود.'
      },
      {
        id: 3,
        question: 'ما هي إعادة التدوير؟',
        options: [
          'التخلص من النفايات',
          'إعادة استخدام المواد لصنع منتجات جديدة',
          'حرق النفايات',
          'دفن النفايات في الأرض'
        ],
        correctAnswer: 1,
        explanation: 'إعادة التدوير هي عملية تحويل النفايات إلى مواد جديدة ومفيدة.'
      }
    ]
  },
  {
    id: 2,
    title: 'ترشيد الطاقة في الجامعة',
    description: 'اختبار متوسط حول طرق توفير الطاقة في البيئة الجامعية',
    difficulty: 'medium',
    timeLimit: 8,
    points: 75,
    category: 'طاقة',
    icon: '⚡',
    questions: [
      {
        id: 1,
        question: 'ما هي أفضل طريقة لتوفير الطاقة في قاعات المحاضرات؟',
        options: [
          'ترك الأضواء مضاءة دائماً',
          'استخدام الإضاءة الطبيعية عند الإمكان',
          'زيادة التكييف',
          'استخدام أجهزة إضافية'
        ],
        correctAnswer: 1,
        explanation: 'استخدام الإضاءة الطبيعية يقلل من استهلاك الكهرباء ويوفر الطاقة.'
      },
      {
        id: 2,
        question: 'كم يمكن توفيره من الطاقة عند إطفاء الكمبيوتر بدلاً من وضعه في وضع الاستعداد؟',
        options: [
          '10-20%',
          '30-40%',
          '50-60%',
          '70-80%'
        ],
        correctAnswer: 3,
        explanation: 'إطفاء الكمبيوتر بالكامل يوفر 70-80% من الطاقة مقارنة بوضع الاستعداد.'
      }
    ]
  },
  {
    id: 3,
    title: 'إدارة النفايات المتقدمة',
    description: 'اختبار متقدم حول تقنيات إدارة النفايات والاقتصاد الدائري',
    difficulty: 'hard',
    timeLimit: 12,
    points: 100,
    category: 'نفايات',
    icon: '♻️',
    completed: true,
    score: 85,
    questions: [
      {
        id: 1,
        question: 'ما هو مبدأ الاقتصاد الدائري؟',
        options: [
          'إنتاج أكبر كمية من السلع',
          'تقليل، إعادة الاستخدام، إعادة التدوير',
          'زيادة الاستهلاك',
          'استخدام مواد جديدة فقط'
        ],
        correctAnswer: 1,
        explanation: 'الاقتصاد الدائري يقوم على مبدأ تقليل النفايات وإعادة استخدام الموارد.'
      }
    ]
  }
];

interface EcoQuizzesProps {
  userPoints: number;
}

export default function EcoQuizzes({ userPoints }: EcoQuizzesProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(quiz.timeLimit * 60); // تحويل إلى ثواني
    setShowExplanation(false);
  };

  const selectAnswer = (answer: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const nextQuestion = () => {
    if (!selectedQuiz) return;
    
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    if (!selectedQuiz) return;

    let correctAnswers = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);
    
    const pointsEarned = Math.round((finalScore / 100) * selectedQuiz.points);
    toast.success(`تم إكمال الاختبار! حصلت على ${pointsEarned} نقطة`);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(0);
    setShowExplanation(false);
  };

  const showAnswer = () => {
    setShowExplanation(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // عرض قائمة الاختبارات
  if (!selectedQuiz) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">الاختبارات البيئية</h2>
            <p className="text-muted-foreground">
              اختبر معلوماتك البيئية واحصل على نقاط إضافية
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {quizzes.filter(q => q.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">اختبار مكتمل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {quizzes.reduce((sum, q) => sum + (q.completed ? q.points : 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">نقطة مكتسبة</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((quizzes.filter(q => q.completed).length / quizzes.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">معدل الإكمال</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.filter(q => q.completed).length || 0}%
                </div>
                <div className="text-sm text-muted-foreground">متوسط الدرجات</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{quizzes.length}</div>
                <div className="text-sm text-muted-foreground">اختبار متاح</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{quiz.icon}</div>
                  {quiz.completed && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      مكتمل
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {getDifficultyName(quiz.difficulty)}
                  </Badge>
                  <Badge variant="outline">{quiz.category}</Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.timeLimit} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>{quiz.questions.length} سؤال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>{quiz.points} نقطة</span>
                  </div>
                </div>

                {quiz.completed && quiz.score && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">أفضل نتيجة:</span>
                      <span className="font-bold text-green-600">{quiz.score}%</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => startQuiz(quiz)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {quiz.completed ? 'إعادة الاختبار' : 'ابدأ الاختبار'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // عرض نتيجة الاختبار
  if (quizCompleted) {
    const pointsEarned = Math.round((score / 100) * selectedQuiz.points);
    const isPassGrade = score >= 60;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isPassGrade ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isPassGrade ? (
                <Trophy className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isPassGrade ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح'}
              </h2>
              <p className="text-muted-foreground">
                لقد أكملت اختبار "{selectedQuiz.title}"
              </p>
            </div>

            <div className="text-6xl font-bold text-primary">{score}%</div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-green-600">{pointsEarned}</div>
                <div className="text-sm text-muted-foreground">نقطة مكتسبة</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedQuiz.questions.filter((_, index) => 
                    selectedAnswers[index] === selectedQuiz.questions[index].correctAnswer
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">إجابة صحيحة</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => startQuiz(selectedQuiz)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={resetQuiz}>
                العودة للقائمة
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // عرض الاختبار
  const currentQ = selectedQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">{selectedQuiz.title}</h2>
            <p className="text-sm text-muted-foreground">
              السؤال {currentQuestion + 1} من {selectedQuiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              إنهاء
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question */}
      <Card className="p6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>
            
            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => selectAnswer(parseInt(value))}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Brain className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">التفسير:</h4>
                  <p className="text-sm text-blue-700">{currentQ.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={showAnswer}
              disabled={showExplanation}
            >
              عرض التفسير
            </Button>
            
            <Button 
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion < selectedQuiz.questions.length - 1 ? (
                <>
                  السؤال التالي
                  <ArrowRight className="w-4 h-4 mr-2" />
                </>
              ) : (
                'إنهاء الاختبار'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}