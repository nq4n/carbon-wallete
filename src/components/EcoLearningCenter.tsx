'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Play, 
  BookOpen, 
  Clock, 
  Eye, 
  ThumbsUp,
  Share2,
  Filter,
  Search,
  CheckCircle,
  Star,
  TrendingUp,
  Recycle,
  Zap,
  Droplets
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LearningContent {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'infographic' | 'article';
  category: 'energy' | 'waste' | 'transport' | 'water' | 'general';
  duration: string;
  views: number;
  likes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image: string;
  points: number;
  completed?: boolean;
  tags: string[];
}

const learningContent: LearningContent[] = [
  {
    id: 1,
    title: 'كيف تؤثر طباعة الأوراق على البيئة؟',
    description: 'تعرف على الأثر البيئي لاستهلاك الورق في الجامعة وطرق تقليله',
    type: 'infographic',
    category: 'waste',
    duration: '3 دقائق',
    views: 1247,
    likes: 89,
    difficulty: 'beginner',
    image: 'https://images.unsplash.com/photo-1719600804011-3bff3909b183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBlciUyMHdhc3RlJTIwZW52aXJvbm1lbnR8ZW58MXx8fHwxNzU2NzEwODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 10,
    completed: true,
    tags: ['ورق', 'طباعة', 'نفايات']
  },
  {
    id: 2,
    title: 'الطاقة المتجددة في الحرم الجامعي',
    description: 'شاهد كيف تستخدم الجامعة الطاقة الشمسية وطاقة الرياح',
    type: 'video',
    category: 'energy',
    duration: '8 دقائق',
    views: 2341,
    likes: 156,
    difficulty: 'intermediate',
    image: 'https://images.unsplash.com/photo-1655300256620-680cb0f1cec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzU2NzEwODIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 15,
    tags: ['طاقة شمسية', 'طاقة متجددة', 'كهرباء']
  },
  {
    id: 3,
    title: 'دليل إعادة التدوير للطلاب',
    description: 'تعلم كيفية فصل النفايات وإعادة تدويرها بطريقة صحيحة',
    type: 'article',
    category: 'waste',
    duration: '5 دقائق',
    views: 987,
    likes: 72,
    difficulty: 'beginner',
    image: 'https://images.unsplash.com/photo-1577010768912-19874598a38e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjBiaW5zJTIwc29ydGluZ3xlbnwxfHx8fDE3NTY3MTA4Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 12,
    tags: ['إعادة تدوير', 'فصل نفايات', 'بيئة']
  },
  {
    id: 4,
    title: 'تأثير وسائل النقل على انبعاثات الكربون',
    description: 'مقارنة بين وسائل النقل المختلفة وأثرها على البيئة',
    type: 'infographic',
    category: 'transport',
    duration: '4 دقائق',
    views: 1543,
    likes: 98,
    difficulty: 'intermediate',
    image: 'https://images.unsplash.com/photo-1651816276658-3dfee771ee15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFuc3BvcnRhdGlvbiUyMGNhcmJvbiUyMGVtaXNzaW9uc3xlbnwxfHx8fDE3NTY3MTA4MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 13,
    completed: true,
    tags: ['نقل', 'انبعاثات', 'كربون']
  },
  {
    id: 5,
    title: 'توفير المياه في السكن الجامعي',
    description: 'طرق عملية لتوفير المياه وتقليل الهدر في الاستخدام اليومي',
    type: 'video',
    category: 'water',
    duration: '6 دقائق',
    views: 876,
    likes: 61,
    difficulty: 'beginner',
    image: 'https://images.unsplash.com/photo-1492962827063-e5ea0d8c01f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGNvbnNlcnZhdGlvbiUyMHRpcHN8ZW58MXx8fHwxNzU2NjMxNjg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 11,
    tags: ['مياه', 'توفير', 'استدامة']
  },
  {
    id: 6,
    title: 'الزراعة المستدامة في الحديقة الجامعية',
    description: 'كيف تساهم الحدائق الجامعية في تحسين البيئة وجودة الهواء',
    type: 'video',
    category: 'general',
    duration: '10 دقائق',
    views: 1876,
    likes: 134,
    difficulty: 'advanced',
    image: 'https://images.unsplash.com/photo-1707844915582-e3ccbf2ef2bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGdhcmRlbmluZyUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzU2NzEwODM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    points: 18,
    tags: ['زراعة', 'حدائق', 'هواء نظيف']
  }
];

export default function EcoLearningCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedContent, setCompletedContent] = useState<number[]>([1, 4]);

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'energy': return 'الطاقة';
      case 'waste': return 'النفايات';
      case 'transport': return 'النقل';
      case 'water': return 'المياه';
      case 'general': return 'عام';
      default: return 'جميع الفئات';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'video': return 'فيديو';
      case 'infographic': return 'إنفوغرافيك';
      case 'article': return 'مقال';
      default: return 'جميع الأنواع';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'waste':
        return <Recycle className="w-4 h-4 text-green-600" />;
      case 'transport':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = learningContent.filter(content => {
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesType = selectedType === 'all' || content.type === selectedType;
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const markAsCompleted = (contentId: number) => {
    if (!completedContent.includes(contentId)) {
      setCompletedContent(prev => [...prev, contentId]);
      const content = learningContent.find(c => c.id === contentId);
      toast.success(`تم إكمال المحتوى! حصلت على ${content?.points} نقطة`);
    }
  };

  const totalPoints = completedContent.reduce((sum, id) => {
    const content = learningContent.find(c => c.id === id);
    return sum + (content?.points || 0);
  }, 0);

  const completionRate = (completedContent.length / learningContent.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مركز التعلم البيئي</h2>
          <p className="text-muted-foreground">
            تعلم كيف تؤثر أنشطتك اليومية على البيئة
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">نقطة مكتسبة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedContent.length}</div>
            <div className="text-xs text-muted-foreground">محتوى مكتمل</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">التقدم الإجمالي</h3>
          <span className="text-sm text-muted-foreground">
            {completedContent.length} من {learningContent.length}
          </span>
        </div>
        <Progress value={completionRate} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          أكملت {Math.round(completionRate)}% من المحتوى التعليمي
        </p>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في المحتوى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="energy">الطاقة</SelectItem>
            <SelectItem value="waste">النفايات</SelectItem>
            <SelectItem value="transport">النقل</SelectItem>
            <SelectItem value="water">المياه</SelectItem>
            <SelectItem value="general">عام</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="infographic">إنفوغرافيك</SelectItem>
            <SelectItem value="article">مقال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <Card key={content.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <ImageWithFallback
                src={content.image}
                alt={content.title}
                className="w-full h-48 object-cover"
              />
              
              {/* Content Type Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90">
                  {content.type === 'video' && <Play className="w-3 h-3 mr-1" />}
                  {content.type === 'infographic' && <BookOpen className="w-3 h-3 mr-1" />}
                  {content.type === 'article' && <BookOpen className="w-3 h-3 mr-1" />}
                  {getTypeName(content.type)}
                </Badge>
              </div>

              {/* Completion Badge */}
              {completedContent.includes(content.id) && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    مكتمل
                  </Badge>
                </div>
              )}

              {/* Duration */}
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="bg-black/80 text-white border-none">
                  <Clock className="w-3 h-3 mr-1" />
                  {content.duration}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                {getCategoryIcon(content.category)}
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{content.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {content.description}
                  </p>
                </div>
              </div>

              {/* Difficulty and Points */}
              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(content.difficulty)}>
                  {content.difficulty === 'beginner' && 'مبتدئ'}
                  {content.difficulty === 'intermediate' && 'متوسط'}
                  {content.difficulty === 'advanced' && 'متقدم'}
                </Badge>
                <Badge variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  {content.points} نقطة
                </Badge>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {content.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {content.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{content.tags.length - 2}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{content.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{content.likes}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => markAsCompleted(content.id)}
                  disabled={completedContent.includes(content.id)}
                >
                  {completedContent.includes(content.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      مكتمل
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      ابدأ التعلم
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold">لا يوجد محتوى</h3>
            <p className="text-muted-foreground">
              لم نجد محتوى يطابق معايير البحث الخاصة بك
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}