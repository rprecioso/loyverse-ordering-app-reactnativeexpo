import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { List, ActivityIndicator, Searchbar } from 'react-native-paper';
import { loyverseAPI, Category, Product, Variant } from '../../lib/api/loyverse';

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const catsData = await fetch("/api/loyverse/categories");
        const cats = await catsData.json();
        setCategories(cats);

        const productMap: Record<string, Product[]> = {};
        for (const cat of cats) {
          const productsData = await fetch("/api/loyverse/products/by-category?category_id="+cat.id);
          const products = await productsData.json();
          productMap[cat.id] = products;
        }
        console.log('productsByCategory');
        console.log(productsByCategory);
        setProductsByCategory(productMap);
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = (variant: Variant, product: Product) => {
    console.log('Add to cart:', {
      productId: product.id,
      variantId: variant.variant_id,
      name: product.item_name,
      variant: variant.option1_value,
      price: variant.default_price,
    });
  };

  const filterProducts = (products: Product[]) => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.item_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  };

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView>
      <Searchbar
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ margin: 10 }}
      />

      {categories.map((category) => {
        const filteredProducts = filterProducts(productsByCategory[category.id] || []);
        if (filteredProducts.length === 0) return null;

        return (
          <List.Accordion
            key={category.id}
            title={category.name}
            expanded={expandedCategory === category.id}
            onPress={() =>
              setExpandedCategory(expandedCategory === category.id ? null : category.id)
            }
          >
            {filteredProducts.map((product) => (
              <List.Accordion
                key={product.id}
                title={product.item_name}
                description={product.description}
                left={() =>
                  product.image_url ? (
                    <Image source={{ uri: product.image_url }} style={styles.image} />
                  ) : null
                }
                expanded={expandedProduct === product.id}
                onPress={() =>
                  setExpandedProduct(expandedProduct === product.id ? null : product.id)
                }
              >
                {product.variants?.map((variant: Variant) => (
                  <View key={variant.variant_id} style={styles.variantRow}>
                    <Text style={styles.variantText}>
                      {variant.option1_value} - ₱{variant.default_price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(variant, product)}
                    >
                      <Text style={styles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </List.Accordion>
            ))}
          </List.Accordion>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  variantText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Menu;