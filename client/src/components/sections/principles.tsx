import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Principle, SiteContent } from "@db/schema";

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

  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  return (
    <section className="relative py-16" style={{ backgroundColor: '#FDF7EB' }}>
      {/* Add decorative bottom edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: '4rem' }}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            style={{ fill: '#fff' }}
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl font-bold mb-4">{siteContent?.find(c => c.key === "principles_title")?.value || "Our Principles"}</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {siteContent?.find(c => c.key === "principles_description")?.value || "These foundational principles guide our daily operations and long-term vision at Little Way Acres."}
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                  <img 
                    src={principle.imageUrl} 
                    alt={principle.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="relative">
                  <motion.div
                    className="absolute -left-4 top-1/2 w-2 h-2 rounded-full bg-stone-800"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  />
                  <h3 className="text-3xl font-bold text-stone-800 pl-4">{principle.title}</h3>
                </div>
                <p className="text-lg text-stone-600 leading-relaxed pl-4" style={{ borderLeft: '2px solid #1f2937' }}>
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
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                      <img 
                        src={principle.imageUrl}
                        alt={principle.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="relative">
                      <motion.div
                        className="absolute -left-4 top-1/2 w-2 h-2 rounded-full bg-stone-800"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                      />
                      <h3 className="text-3xl font-bold text-stone-800 pl-4">{principle.title}</h3>
                    </div>
                    <p className="text-lg text-stone-600 leading-relaxed pl-4" style={{ borderLeft: '2px solid #1f2937' }}>
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