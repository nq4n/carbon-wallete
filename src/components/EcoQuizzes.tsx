'use client';
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './auth/AuthProvider';
import { 
  Brain, Clock, Trophy, CheckCircle, Star, Play, Target, Timer, ArrowRight, Loader2, Leaf, Zap, Recycle, Car, Utensils 
} from 'lucide-react';

const QuizIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'leaf': return <Leaf className={className} />;
    case 'zap':
    case 'bolt': return <Zap className={className} />;
    case 'recycle': return <Recycle className={className} />;
    case 'car': return <Car className={className} />;
    case 'utensils': return <Utensils className={className} />;
    default: return null;
  }
};

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_minutes: number;
  points: number;
  category: string;
  icon: string;
  questions: QuizQuestion[];
  completed?: boolean;
  score?: number;
}

export default function EcoQuizzes() {
  const { user, loading: authLoading, refreshUser } = useAuthContext();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchQuizzesAndAttempts();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!selectedQuiz || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          completeQuiz(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz, quizCompleted]);

  const fetchQuizzesAndAttempts = async () => {
    setLoading(true);
    let { data: quizzesData, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`*,
        questions:quiz_questions(*)`)
      .order('id');

    if (quizzesError) {
      toast.error('Failed to load quizzes.');
      setLoading(false);
      return;
    }

    if (user) {
      let { data: attemptsData, error: attemptsError } = await supabase
        .from('user_quiz_attempts')
        .select('quiz_id, score')
        .eq('user_id', user.id);
      
      if (attemptsData && !attemptsError) {
        const attemptsMap = new Map<number, number>();
        for (const attempt of attemptsData) {
            const existingScore = attemptsMap.get(attempt.quiz_id) || 0;
            if (attempt.score > existingScore) {
                attemptsMap.set(attempt.quiz_id, attempt.score);
            }
        }
        quizzesData = (quizzesData ?? []).map(quiz => ({
          ...quiz,
          completed: attemptsMap.has(quiz.id),
          score: attemptsMap.get(quiz.id),
        }));
      }
    }

    setQuizzes((quizzesData ?? []) as Quiz[]);
    setLoading(false);
  };

  const getDifficultyColor = (d: string) => d === 'easy' ? 'bg-green-100 text-green-800' : d === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const getDifficultyName = (d: string) => d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب';

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(quiz.time_limit_minutes * 60);
    setShowExplanation(false);
    setIsSubmitting(false);
  };

  const selectAnswer = (answer: number) => setSelectedAnswers(p => ({ ...p, [currentQuestion]: answer }));

  const nextQuestion = () => {
    if (!selectedQuiz) return;
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(p => p + 1);
      setShowExplanation(false);
    } else {
      if (!isSubmitting && !quizCompleted) {
        completeQuiz();
      }
    }
  };

  const completeQuiz = async () => {
    if (!selectedQuiz || !user || quizCompleted || isSubmitting) return;
  
    setIsSubmitting(true);
  
    try {
      // 1) Calculate score
      let correct = 0;
      selectedQuiz.questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correct_answer_index) correct++;
      });
      const finalScore = Math.round(
        (correct / selectedQuiz.questions.length) * 100
      );
      setScore(finalScore);
  
      // 2) Get previous best score
      const { data: existingAttempts, error: fetchError } = await supabase
        .from("user_quiz_attempts")
        .select("score")
        .eq("user_id", user.id)
        .eq("quiz_id", selectedQuiz.id);
  
      if (fetchError) {
        console.error("fetchError", fetchError);
        toast.error("Could not verify your previous score. Please try again.");
        return;
      }
  
      const previousBestScore =
        existingAttempts && existingAttempts.length > 0
          ? Math.max(...existingAttempts.map((a) => a.score))
          : 0;
  
      // 3) If this is a new high score, save it and add points
      if (finalScore > previousBestScore) {
        const oldPoints = Math.round(
          selectedQuiz.points * (previousBestScore / 100)
        );
        const newPoints = Math.round(
          selectedQuiz.points * (finalScore / 100)
        );
        const pointsToAdd = newPoints - oldPoints; // 👈 DEFINED HERE
  
        // Save attempt (upsert – one row per user+quiz)
        const { error: upsertError } = await supabase
          .from("user_quiz_attempts")
          .upsert(
            {
              user_id: user.id,
              quiz_id: selectedQuiz.id,
              score: finalScore,
              points_earned: pointsToAdd,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,quiz_id" } // 👈 no space
          );
  
        if (upsertError) {
          console.error("upsertError", upsertError);
          toast.error("Could not save your new high score.");
          return;
        }
  
        // Update user total points only if > 0
        if (pointsToAdd > 0) {
          const { error: rpcError } = await supabase.rpc(
            "increment_user_points",
            { p_user_id: user.id, p_points: pointsToAdd }
          );
  
          if (rpcError) {
            console.error("rpcError", rpcError);
            toast.error("Failed to update your total points.");
          } else {
            toast.success(
              `🎉 New high score! You earned ${pointsToAdd} more points.`
            );
            refreshUser();
          }
        } else {
          toast.success(`Quiz complete! Your score: ${finalScore}%`);
        }
  
        // Update local quizzes list
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === selectedQuiz.id
              ? { ...q, completed: true, score: finalScore }
              : q
          )
        );
      } else {
        // Not a new high score
        toast.info(
          `Your score of ${finalScore}% did not beat your previous best of ${previousBestScore}%. Keep trying!`
        );
      }
  
      setQuizCompleted(true);
    } catch (e) {
      console.error("completeQuiz error", e);
      toast.error(
        `An unexpected error occurred during quiz completion: ${
          (e as Error).message
        }`
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSelectedQuiz(null);
        fetchQuizzesAndAttempts(); // refresh list & best scores
      }, 2000);
    }
  };
  
  const resetQuiz = () => {
    if (isSubmitting) return;
    setSelectedQuiz(null);
  };

  const showAnswer = () => setShowExplanation(true);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-16 h-16 animate-spin text-green-600" /></div>;
  }

  if (!selectedQuiz) {
    const completedQuizzes = quizzes.filter(q => q.completed).length;
    const totalPoints = quizzes.reduce((sum, q) => {
        if (!q.completed || !q.score) return sum;
        const pointsEarned = Math.round(q.points * (q.score / 100));
        return sum + pointsEarned;
    }, 0);
    const avgScore = completedQuizzes > 0 ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizzes) : 0;

    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold">الاختبارات البيئية</h2><p className="text-muted-foreground">اختبر معلوماتك البيئية واكسب النقاط</p></div>
          <div className="flex items-center gap-4">
            <div className="text-center"><div className="text-2xl font-bold text-blue-600">{completedQuizzes}</div><div className="text-xs text-muted-foreground">اختبار مكتمل</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{totalPoints}</div><div className="text-xs text-muted-foreground">نقطة مكتسبة</div></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Trophy className="w-5 h-5 text-green-600" /></div><div><div className="text-2xl font-bold">{quizzes.length > 0 ? Math.round((completedQuizzes / quizzes.length) * 100) : 0}%</div><div className="text-sm text-muted-foreground">معدل الإكمال</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Target className="w-5 h-5 text-blue-600" /></div><div><div className="text-2xl font-bold">{avgScore}%</div><div className="text-sm text-muted-foreground">متوسط الدرجات</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Brain className="w-5 h-5 text-purple-600" /></div><div><div className="text-2xl font-bold">{quizzes.length}</div><div className="text-sm text-muted-foreground">اختبار متاح</div></div></div></Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => {
            const cleanTitle = quiz.title.replace(/^[\u26A1-\uD83C\uDF31\s]+/, '');
            return (
            <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-6 space-y-4 flex flex-col flex-grow">
                <div className="flex-grow">
                   <h3 className="font-semibold mb-2 flex items-center gap-2"><QuizIcon name={quiz.icon} className="w-5 h-5 text-green-600" /> {cleanTitle}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{quiz.description}</p>
                </div>
                 <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{getDifficultyName(quiz.difficulty)}</Badge>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {quiz.points}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.time_limit_minutes} min</span>
                </div>
                {quiz.completed && quiz.score != null && (
                  <div className="p-3 bg-green-50 rounded-lg"><div className="flex items-center justify-between"><span className="text-sm text-green-800">أفضل نتيجة:</span><span className="font-bold text-green-600">{quiz.score}%</span></div></div>
                )}
                <Button className="w-full mt-auto" onClick={() => startQuiz(quiz)}><Play className="w-4 h-4 ml-2" />{quiz.completed ? 'إعادة الاختبار' : 'ابدأ الاختبار'}</Button>
              </div>
            </Card>
          )})}
        </div>
      </div>
    );
  }

  const currentQ = selectedQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

  const isLastQuestion = currentQuestion === selectedQuiz.questions.length - 1;
  const canProceed = selectedAnswers[currentQuestion] !== undefined && !isSubmitting && !quizCompleted;

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">{selectedQuiz.title.replace(/^[\u26A1-\uD83C\uDF31\s]+/, '')}</h2>
            <p className="text-sm text-muted-foreground">السؤال {currentQuestion + 1} من {selectedQuiz.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Timer className="w-4 h-4" /><span>{formatTime(timeLeft)}</span></div>
            <Button variant="outline" size="sm" onClick={resetQuiz} disabled={isSubmitting}>إنهاء</Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-right">{currentQ.question}</h3>
            <RadioGroup key={currentQ.id} value={selectedAnswers[currentQuestion]?.toString() ?? ''} onValueChange={v => selectAnswer(parseInt(v))} className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div key={`${currentQ.id}-${index}`} className="flex items-center flex-row-reverse space-x-2 space-x-reverse">
                  <RadioGroupItem value={index.toString()} id={`q${currentQ.id}-o${index}`} disabled={isSubmitting || quizCompleted} />
                  <Label htmlFor={`q${currentQ.id}-o${index}`} className="flex-1 text-right cursor-pointer p-3 rounded-lg border hover:bg-accent transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          {showExplanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-right"><div className="flex items-start gap-2">
              <div className="p-1 bg-blue-100 rounded"><Brain className="w-4 h-4 text-blue-600" /></div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">التفسير:</h4>
                <p className="text-sm text-blue-700">{currentQ.explanation}</p>
              </div>
            </div></div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={showAnswer} disabled={showExplanation || isSubmitting || quizCompleted}>عرض التفسير</Button>
            <Button onClick={nextQuestion} disabled={!canProceed}>
              {isLastQuestion ? (isSubmitting || quizCompleted ? 'تم الإرسال' : 'إنهاء الاختبار') : (<><ArrowRight className="w-4 h-4 ml-2" />السؤال التالي</>)}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
