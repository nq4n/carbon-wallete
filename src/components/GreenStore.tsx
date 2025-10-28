'use client';
import React from 'react';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ShoppingBag, 
  Heart, 
  Star,
  Filter,
  Search,
  Coins,
  Check,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'cups' | 'office' | 'tech' | 'accessories';
  image: string;
  rating: number;
  reviews: number;
  ecoPoints: number;
  inStock: number;
  features: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: 'كوب القهوة البامبو الطبيعي',
    description: 'كوب قابل لإعادة الاستخدام مصنوع من ألياف البامبو الطبيعية',
    price: 250,
    originalPrice: 350,
    category: 'cups',
    image: 'https://images.unsplash.com/photo-1641754644192-24e09c2b444b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBjdXBzJTIwYmFtYm9vfGVufDF8fHx8MTc1NjcwNzk5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 156,
    ecoPoints: 15,
    inStock: 45,
    features: ['مقاوم للحرارة', 'قابل للتحلل', 'غطاء محكم'],
    isPopular: true
  },
  {
    id: 2,
    name: 'دفتر ملاحظات معاد التدوير',
    description: 'دفتر أنيق مصنوع من الورق المعاد تدويره 100%',
    price: 180,
    category: 'office',
    image: 'https://images.unsplash.com/photo-1625533617580-3977f2651fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xlZCUyMG5vdGVib29rJTIwb2ZmaWNlfGVufDF8fHx8MTc1NjcwNzk5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 89,
    ecoPoints: 10,
    inStock: 32,
    features: ['ورق معاد التدوير', 'غلاف طبيعي', '200 صفحة'],
    isNew: true
  },
  {
    id: 3,
    name: 'شاحن لاسلكي بالطاقة الشمسية',
    description: 'شاحن ذكي يعمل بالطاقة الشمسية لجميع الأجهزة',
    price: 450,
    originalPrice: 600,
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1739268984311-b478fccf256e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHdpcmVsZXNzJTIwY2hhcmdlcnxlbnwxfHx8fDE3NTY3MDgwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 203,
    ecoPoints: 25,
    inStock: 18,
    features: ['طاقة شمسية', 'شحن لاسلكي', 'مقاوم للماء'],
    isPopular: true
  },
  {
    id: 4,
    name: 'قلم حبر من الخشب المستدام',
    description: 'أقلام فاخرة مصنوعة من أخشاب مستدامة معتمدة',
    price: 120,
    category: 'office',
    image: 'https://images.unsplash.com/photo-1616782910751-d48be696d41c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMHdvb2RlbiUyMHBlbnxlbnwxfHx8fDE3NTY3MDgwMDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.4,
    reviews: 67,
    ecoPoints: 8,
    inStock: 76,
    features: ['خشب مستدام', 'حبر طبيعي', 'تصميم أنيق']
  },
  {
    id: 5,
    name: 'حقيبة تسوق قابلة للطي',
    description: 'حقيبة متينة قابلة للطي من المواد المعاد تدويرها',
    price: 95,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1732963878674-651e7f5f71d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb2xkYWJsZSUyMHNob3BwaW5nJTIwYmFnJTIwZWNvfGVufDF8fHx8MTc1NjcwODAwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 124,
    ecoPoints: 6,
    inStock: 89,
    features: ['قابلة للطي', 'متينة', 'خفيفة الوزن'],
    isNew: true
  },
  {
    id: 6,
    name: 'زجاجة مياه ذكية معزولة',
    description: 'زجاجة مياه ذكية تحافظ على درجة الحرارة لـ 12 ساعة',
    price: 320,
    category: 'cups',
    image: 'https://images.unsplash.com/photo-1592999641298-434e28c11d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGluc3VsYXRlZCUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc1NjcwODAxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 178,
    ecoPoints: 18,
    inStock: 41,
    features: ['عزل حراري', 'مؤشر حرارة', 'ستانلس ستيل']
  },
  {
    id: 7,
    name: 'بنك طاقة شمسي محمول',
    description: 'بنك طاقة عالي السعة يشحن بالطاقة الشمسية',
    price: 380,
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1662078907135-129bc558e5f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0YWJsZSUyMHNvbGFyJTIwcG93ZXIlMjBiYW5rfGVufDF8fHx8MTc1NjcwODAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    reviews: 145,
    ecoPoints: 22,
    inStock: 27,
    features: ['10000 مللي أمبير', 'شحن سريع', 'مقاوم للصدمات']
  },
  {
    id: 8,
    name: 'مجموعة أدوات مكتبية بيئية',
    description: 'مجموعة كاملة من الأدوات المكتبية الصديقة للبيئة',
    price: 280,
    originalPrice: 400,
    category: 'office',
    image: 'https://images.unsplash.com/photo-1584154033675-28a7436937bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBvZmZpY2UlMjBzdXBwbGllcyUyMHNldHxlbnwxfHx8fDE3NTY3MDgwMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 92,
    ecoPoints: 16,
    inStock: 35,
    features: ['8 قطع', 'مواد طبيعية', 'حقيبة منظمة'],
    isPopular: true
  }
];

interface GreenStoreProps {
  userPoints: number;
}

export default function GreenStore({ userPoints }: GreenStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [wishlist, setWishlist] = useState<number[]>([]);

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cups': return 'أكواب وزجاجات';
      case 'office': return 'أدوات مكتبية';
      case 'tech': return 'تقنية خضراء';
      case 'accessories': return 'إكسسوارات';
      default: return 'جميع المنتجات';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('تم إضافة المنتج إلى السلة');
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalCartPrice = () => {
    return Object.entries(cart).reduce((total, [productId, count]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * count : 0);
    }, 0);
  };

  const canAfford = (price: number) => {
    return userPoints >= price;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">المتجر الأخضر</h2>
          <p className="text-muted-foreground">
            اشتر منتجات صديقة للبيئة باستخدام نقاطك
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Coins className="w-4 h-4 mr-2" />
            {userPoints} نقطة متاحة
          </Badge>
          
          {getTotalCartItems() > 0 && (
            <Button variant="outline" className="relative">
              <ShoppingCart className="w-4 h-4" />
              <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center">
                {getTotalCartItems()}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المنتجات</SelectItem>
            <SelectItem value="cups">أكواب وزجاجات</SelectItem>
            <SelectItem value="office">أدوات مكتبية</SelectItem>
            <SelectItem value="tech">تقنية خضراء</SelectItem>
            <SelectItem value="accessories">إكسسوارات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shopping Cart Summary */}
      {getTotalCartItems() > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <span className="font-medium">
                {getTotalCartItems()} منتج في السلة
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-green-600">
                {getTotalCartPrice()} نقطة
              </span>
              <Button 
                size="sm" 
                disabled={!canAfford(getTotalCartPrice())}
                onClick={() => {
                  if (canAfford(getTotalCartPrice())) {
                    toast.success('تم إتمام عملية الشراء بنجاح!');
                    setCart({});
                  }
                }}
              >
                إتمام الشراء
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {product.isNew && (
                  <Badge className="bg-blue-600">جديد</Badge>
                )}
                {product.isPopular && (
                  <Badge className="bg-orange-600">رائج</Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>

              {/* Eco Points Badge */}
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="bg-white/90">
                  +{product.ecoPoints} نقطة بيئية
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews} تقييم)
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {product.features.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.features.length - 2}
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{product.price} نقطة</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                {product.inStock > 0 ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">متوفر ({product.inStock} قطعة)</span>
                  </>
                ) : (
                  <span className="text-red-600">غير متوفر</span>
                )}
              </div>

              {/* Add to Cart */}
              <div className="flex items-center gap-2">
                {cart[product.id] ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => removeFromCart(product.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1 bg-accent rounded text-sm font-medium">
                      {cart[product.id]}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock || !canAfford(product.price)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock || !canAfford(product.price)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    إضافة للسلة
                  </Button>
                )}
              </div>

              {!canAfford(product.price) && (
                <p className="text-xs text-red-600 text-center">
                  تحتاج {product.price - userPoints} نقطة إضافية
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold">لا توجد منتجات</h3>
            <p className="text-muted-foreground">
              لم نجد منتجات تطابق معايير البحث الخاصة بك
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}