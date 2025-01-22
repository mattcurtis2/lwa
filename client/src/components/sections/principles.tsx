import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Principle } from "@db/schema";

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Principles() {
  const { data: principles } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
  });

  return (
    <section className="py-16 bg-stone-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl font-bold mb-4">Our Principles</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            These foundational principles guide our daily operations and long-term vision at Little Way Acres.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {principles?.sort((a, b) => a.order - b.order).map((principle) => (
            <motion.div 
              key={principle.id}
              variants={fadeInUp}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={principle.imageUrl} 
                  alt={principle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                <p className="text-stone-600">{principle.description}</p>
              </div>
            </motion.div>
          ))}

          {/* Fallback content when no principles are loaded */}
          {(!principles || principles.length === 0) && (
            <>
              <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-stone-200">
                  <img 
                    src="https://images.unsplash.com/photo-1439853949127-fa647821eba0"
                    alt="Beautiful"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Beautiful</h3>
                  <p className="text-stone-600">We believe in creating and maintaining beauty in everything we do, from our landscaping to our animal care.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-stone-200">
                  <img 
                    src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"
                    alt="Bountiful"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Bountiful</h3>
                  <p className="text-stone-600">Our farm strives to produce abundance through sustainable practices and careful stewardship of our resources.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-stone-200">
                  <img 
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433"
                    alt="In Service To Our Neighbors"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">In Service To Our Neighbors</h3>
                  <p className="text-stone-600">We're committed to serving our local community through our products, education, and sustainable farming practices.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-stone-200">
                  <img 
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e"
                    alt="Profitable, Eventually"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Profitable, Eventually</h3>
                  <p className="text-stone-600">We balance our commitment to quality and community with sustainable business practices for long-term success.</p>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
