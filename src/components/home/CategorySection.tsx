import { Link } from "react-router-dom";

const categories = [
  {
    name: "Newborn",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop",
    path: "/category/newborn",
  },
  {
    name: "Dresses",
    image: "https://images.unsplash.com/photo-1596870048198-9bac8304f955?w=600&h=400&fit=crop",
    path: "/category/dresses",
  },
  {
    name: "Toys",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop",
    path: "/category/toys",
  },
  {
    name: "Boys",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=400&fit=crop",
    path: "/category/boys",
  },
  {
    name: "Girls",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=400&fit=crop",
    path: "/category/girls",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop",
    path: "/category/accessories",
  },
];

const CategorySection = () => {
  return (
    <section className="container mx-auto px-4 py-12 bg-muted/30">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
        <p className="text-muted-foreground">Discover our wide range of products</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={category.path}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
              <h3 className="text-white font-bold text-xl md:text-2xl">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
