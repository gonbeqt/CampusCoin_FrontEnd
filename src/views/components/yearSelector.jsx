import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function YearSelector({ availableYears, currentYear, setCurrentYear }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayYears, setDisplayYears] = useState([]);

  // 3-second loading delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Set up the visible years based on available years count
  useEffect(() => {
    if (availableYears.length === 0) return;
    
    if (availableYears.length === 1) {
      setDisplayYears([currentYear]);
    } else if (availableYears.length === 2) {
      const otherYear = availableYears.find(y => y !== currentYear);
      setDisplayYears([currentYear, otherYear]);
    } else {
      // 3 or more years - show previous, current, next
      const currentIndex = availableYears.indexOf(currentYear);
      const prevIndex = (currentIndex - 1 + availableYears.length) % availableYears.length;
      const nextIndex = (currentIndex + 1) % availableYears.length;
      
      setDisplayYears([
        availableYears[prevIndex],
        currentYear,
        availableYears[nextIndex]
      ]);
    }
  }, [currentYear, availableYears]);

  const handleYearChange = (year) => {
    if (isLoading || isAnimating || year === currentYear) return;

    setIsAnimating(true);
    setCurrentYear(year);
    
    // Reset animation lock after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Carousel wheel animation variants for 3+ years
  const wheelVariants = {
    left: {
      x: -85,
      scale: 0.75,
      opacity: 0.6,
      zIndex: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 3,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    right: {
      x: 85,
      scale: 0.75,
      opacity: 0.6,
      zIndex: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    enterFromBack: {
      x: 0,
      scale: 0.5,
      opacity: 0,
      zIndex: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exitToBack: {
      x: 0,
      scale: 0.5,
      opacity: 0,
      zIndex: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Variants for 2 years
  const twoYearVariants = {
    active: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    inactive: {
      scale: 0.85,
      opacity: 0.6,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
  };

  if (availableYears.length === 0) return null;

  // Calculate container width based on number of years
  const getContainerWidth = () => {
    if (availableYears.length === 1) return '120px';
    if (availableYears.length === 2) return '200px';
    return '280px'; // 3+ years
  };

  return (
    <div className="flex items-center justify-center my-1">
      <div className="relative">
        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 rounded-lg backdrop-blur-sm"
              style={{ width: getContainerWidth(), height: '56px', left: '50%', transform: 'translateX(-50%)' }}
            >
              <div className="flex space-x-1.5">
                <motion.div
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: getContainerWidth(), height: '56px' }}
        >
          {/* Single year display */}
          {availableYears.length === 1 && (
            <div className="flex items-center justify-center h-full">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md text-sm">
                {currentYear}
              </div>
            </div>
          )}

          {/* Two years display */}
          {availableYears.length === 2 && (
            <div className="flex items-center justify-center h-full gap-3">
              {displayYears.map((year) => (
                <motion.button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  disabled={isLoading || isAnimating}
                  variants={twoYearVariants}
                  animate={year === currentYear ? "active" : "inactive"}
                  whileHover={!isLoading && !isAnimating && year !== currentYear ? { scale: 0.9 } : {}}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                    ${year === currentYear 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md cursor-default'
                      : isLoading || isAnimating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-600 shadow-sm cursor-pointer hover:shadow-md hover:text-blue-600'
                    }
                  `}
                >
                  {year}
                </motion.button>
              ))}
            </div>
          )}

          {/* Three+ years carousel display */}
          {availableYears.length >= 3 && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent rounded-lg" />
              
              {/* Years carousel */}
              <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '600px' }}>
                <AnimatePresence mode="sync">
                  {displayYears.map((year, index) => {
                    let animate = "center";
                    
                    if (index === 0) animate = "left";
                    else if (index === 2) animate = "right";
                    
                    return (
                      <motion.button
                        key={`${year}-${index}`}
                        onClick={() => handleYearChange(year)}
                        disabled={isLoading || isAnimating || year === currentYear}
                        variants={wheelVariants}
                        initial={index === 1 ? "center" : index === 0 ? "enterFromBack" : "enterFromBack"}
                        animate={animate}
                        exit="exitToBack"
                        whileHover={
                          !isLoading && !isAnimating && year !== currentYear 
                            ? { scale: 0.8 } 
                            : {}
                        }
                        className={`
                          absolute px-4 py-2 rounded-lg font-medium transition-all text-sm
                          ${year === currentYear 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md cursor-default'
                            : isLoading || isAnimating
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-600 shadow-sm cursor-pointer hover:text-blue-600 hover:shadow-md'
                          }
                        `}
                        style={{
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {year}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}