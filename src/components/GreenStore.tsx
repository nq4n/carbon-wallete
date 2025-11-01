'use client';
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './auth/AuthProvider';

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
  ShoppingCart,
  Loader2,
  Store
} from 'lucide-react';

interface Product {
  id: number;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: 'cups' | 'office' | 'tech' | 'accessories';
  image: string;
  rating: number;
  reviews: number;
  eco_points: number;
  in_stock: number;
  features: string[];
  is_new?: boolean;
  is_popular?: boolean;
  shops: { name: string }; // Join data
}

interface Shop {
  id: string;
  name: string;
}

export default function GreenStore() {
  const { user, profile, loading: authLoading } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    if (!authLoading && profile) {
      setUserPoints(profile.points);
    }
    fetchData();
  }, [authLoading, profile]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch both shops and products
    const [{ data: shopsData, error: shopsError }, { data: productsData, error: productsError }] = await Promise.all([
      supabase.from('shops').select('id, name'),
      supabase.from('products').select('*, shops!inner(name)') // Inner join
    ]);

    if (shopsError || productsError) {
      toast.error('Failed to load store data. Please refresh.');
    } else {
      setShops(shopsData as Shop[]);
      setProducts(productsData as Product[]);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!user || !profile) {
      toast.error('You must be logged in to purchase.');
      return;
    }
    const totalCost = getTotalCartPrice();
    if (userPoints < totalCost) {
      toast.error('Insufficient points.');
      return;
    }
    const newPoints = userPoints - totalCost;
    const { error } = await supabase.from('user_profiles').update({ points: newPoints }).eq('id', user.id);
    if (error) {
      toast.error('Purchase failed. Please try again.');
    } else {
      setUserPoints(newPoints);
      setCart({});
      toast.success(`Purchase successful! You have ${newPoints} points remaining.`);
    }
  };

  const filteredProducts = products.filter(p => 
    (selectedShop === 'all' || p.shop_id === selectedShop) &&
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (productId: number) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    toast.success('Product added to cart.');
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) newCart[productId]--;
      else delete newCart[productId];
      return newCart;
    });
  };

  const toggleWishlist = (productId: number) => setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  const getTotalCartItems = () => Object.values(cart).reduce((sum, count) => sum + count, 0);
  const getTotalCartPrice = () => Object.entries(cart).reduce((total, [id, count]) => {
    const product = products.find(p => p.id === parseInt(id));
    return total + (product ? product.price * count : 0);
  }, 0);
  const canAfford = (price: number) => userPoints >= price;

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-16 h-16 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Points */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">المتجر الأخضر</h2>
          <p className="text-muted-foreground">اشترِ منتجات صديقة للبيئة باستخدام نقاطك</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-2 text-lg"><Coins className="w-5 h-5 ml-2 text-yellow-500" />{userPoints.toLocaleString()} نقطة</Badge>
          {getTotalCartItems() > 0 && <Button variant="outline" className="relative"><ShoppingCart className="w-5 h-5" /><Badge className="absolute -top-2 -right-2 px-2">{getTotalCartItems()}</Badge></Button>}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" /><Input placeholder="ابحث عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10" /></div>
        <Select value={selectedShop} onValueChange={setSelectedShop}>
          <SelectTrigger className="w-full md:w-52"><Store className="w-4 h-4 ml-2" /><SelectValue placeholder="اختر متجرًا" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المتاجر</SelectItem>
            {shops.map(shop => <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-52"><Filter className="w-4 h-4 ml-2" /><SelectValue placeholder="اختر فئة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            <SelectItem value="cups">أكواب وزجاجات</SelectItem>
            <SelectItem value="office">أدوات مكتبية</SelectItem>
            <SelectItem value="tech">تقنية خضراء</SelectItem>
            <SelectItem value="accessories">إكسسوارات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cart Summary */}
      {getTotalCartItems() > 0 && (
          <Card className="p-4 bg-green-50 border-green-200"><div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-green-600" /><span className="font-medium">{getTotalCartItems()} منتج في السلة</span></div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-green-600">{getTotalCartPrice().toLocaleString()} نقطة</span>
              <Button size="sm" disabled={!canAfford(getTotalCartPrice())} onClick={handlePurchase}>إتمام الشراء</Button>
            </div>
          </div></Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow flex flex-col">
            <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.is_new && <Badge className="bg-blue-600">جديد</Badge>}
                  {product.is_popular && <Badge className="bg-orange-600">رائج</Badge>}
                </div>
                <Button variant="ghost" size="sm" className="absolute top-2 left-2 w-8 h-8 p-0 bg-white/80 hover:bg-white" onClick={() => toggleWishlist(product.id)}><Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} /></Button>
                <div className="absolute bottom-2 right-2"><Badge variant="outline" className="bg-white/90">+{product.eco_points} نقطة بيئية</Badge></div>
            </div>
            <div className="p-4 space-y-3 flex flex-col flex-grow">
              <Badge variant="secondary" className="w-fit">{product.shops.name}</Badge>
              <div>
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{product.description}</p>
              </div>
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{product.rating}</span></div>
                  <span className="text-xs text-muted-foreground">({product.reviews} تقييم)</span>
              </div>
              <div className="flex flex-wrap gap-1 h-6">
                  {product.features?.slice(0, 2).map((feature, i) => <Badge key={i} variant="outline">{feature}</Badge>)}
                  {product.features?.length > 2 && <Badge variant="outline">+{product.features.length - 2}</Badge>}
              </div>
              <div className="flex items-center gap-2 pt-2">
                  <span className="font-bold text-lg">{product.price.toLocaleString()} نقطة</span>
                  {product.original_price && <span className="text-sm text-muted-foreground line-through">{product.original_price.toLocaleString()}</span>}
              </div>
              <div className="mt-auto pt-2">
                <div className="flex items-center gap-2 text-sm mb-2">
                  {product.in_stock > 0 ? <><Check className="w-4 h-4 text-green-600" /><span>متوفر ({product.in_stock})</span></> : <span className="text-red-600">غير متوفر</span>}
                </div>
                {cart[product.id] ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => removeFromCart(product.id)}><Minus className="w-4 h-4" /></Button>
                      <span className="px-3 py-1 bg-accent rounded text-sm font-medium">{cart[product.id]}</span>
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => addToCart(product.id)} disabled={cart[product.id] >= product.in_stock || !canAfford(getTotalCartPrice() + product.price)}><Plus className="w-4 h-4" /></Button>
                    </div>
                ) : (
                    <Button className="w-full" onClick={() => addToCart(product.id)} disabled={product.in_stock <= 0 || !canAfford(product.price)}><ShoppingBag className="w-4 h-4 ml-2" />إضافة للسلة</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
          <Card className="p-8 col-span-full"><div className="text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold">لا توجد منتجات مطابقة</h3>
            <p className="text-muted-foreground">حاول تغيير فلاتر البحث للعثور على ما تبحث عنه.</p>
          </div></Card>
      )}
    </div>
  );
}
