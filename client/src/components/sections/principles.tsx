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
    <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
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
          className="space-y-24"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {principles?.sort((a, b) => a.order - b.order).map((principle, index) => (
            <motion.div 
              key={principle.id}
              variants={fadeInUp}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? '' : 'md:flex-row-reverse'
              }`}
            >
              <div className="w-full md:w-1/2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl group">
                  <div className="absolute inset-0" style={{ 
                    background: 'linear-gradient(135deg, rgba(71, 98, 81, 0.2), rgba(71, 98, 81, 0.3))',
                    opacity: 1,
                    transition: 'opacity 0.5s'
                  }} />
                  <img 
                    src={principle.imageUrl} 
                    alt={principle.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#476251]/50 to-transparent" />
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-2"
                    style={{ backgroundColor: '#476251' }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="relative">
                  <motion.div
                    className="absolute -left-4 top-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#476251' }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  />
                  <h3 className="text-3xl font-bold text-stone-800 pl-4">{principle.title}</h3>
                </div>
                <p className="text-lg text-stone-600 leading-relaxed pl-4" style={{ borderLeft: '2px solid #476251' }}>
                  {principle.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Fallback content when no principles are loaded */}
          {(!principles || principles.length === 0) && (
            <>
              {[
                {
                  title: "Beautiful",
                  description: "We believe in creating and maintaining beauty in everything we do, from our landscaping to our animal care.",
                  imageUrl: "https://images.unsplash.com/photo-1439853949127-fa647821eba0"
                },
                {
                  title: "Bountiful",
                  description: "Our farm strives to produce abundance through sustainable practices and careful stewardship of our resources.",
                  imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"
                },
                {
                  title: "In Service To Our Neighbors",
                  description: "We're committed to serving our local community through our products, education, and sustainable farming practices.",
                  imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433"
                },
                {
                  title: "Profitable, Eventually",
                  description: "We balance our commitment to quality and community with sustainable business practices for long-term success.",
                  imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e"
                }
              ].map((principle, index) => (
                <motion.div 
                  key={principle.title}
                  variants={fadeInUp}
                  className={`flex flex-col md:flex-row items-center gap-8 mb-24 ${
                    index % 2 === 0 ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl group">
                      <div className="absolute inset-0" style={{ 
                        background: 'linear-gradient(135deg, rgba(71, 98, 81, 0.2), rgba(71, 98, 81, 0.3))',
                        opacity: 1,
                        transition: 'opacity 0.5s'
                      }} />
                      <img 
                        src={principle.imageUrl}
                        alt={principle.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#476251]/50 to-transparent" />
                      <motion.div 
                        className="absolute bottom-0 left-0 w-full h-2"
                        style={{ backgroundColor: '#476251' }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="relative">
                      <motion.div
                        className="absolute -left-4 top-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#476251' }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                      />
                      <h3 className="text-3xl font-bold text-stone-800 pl-4">{principle.title}</h3>
                    </div>
                    <p className="text-lg text-stone-600 leading-relaxed pl-4" style={{ borderLeft: '2px solid #476251' }}>
                      {principle.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}