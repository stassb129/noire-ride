'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Clock, DollarSign } from 'lucide-react';
import { useLocale } from 'next-intl';
import styles from './Stats.module.scss';

const Stats = () => {
  const locale = useLocale();

  const stats = [
    {
      icon: Shield,
      value: '8+',
      label: locale === 'ru' ? 'Лет опыта' : 'Years experience',
      description: locale === 'ru' ? 'На рынке премиум-перевозок' : 'In premium transportation',
    },
    {
      icon: Users,
      value: '500+',
      label: locale === 'ru' ? 'Клиентов' : 'Clients',
      description: locale === 'ru' ? 'Довольных пассажиров' : 'Satisfied passengers',
    },
    {
      icon: Clock,
      value: '24/7',
      label: locale === 'ru' ? 'Поддержка' : 'Support',
      description: locale === 'ru' ? 'Всегда на связи' : 'Always available',
    },
    {
      icon: DollarSign,
      value: '100%',
      label: locale === 'ru' ? 'Фиксированная цена' : 'Fixed price',
      description: locale === 'ru' ? 'Без скрытых доплат' : 'No hidden fees',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className={styles.stats}>
      <div className={styles.container}>
        <motion.div
          className={styles.grid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <div className={styles.value}>{stat.value}</div>
                <div className={styles.label}>{stat.label}</div>
                <div className={styles.description}>{stat.description}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
