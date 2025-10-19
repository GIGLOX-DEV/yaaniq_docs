import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '22 Microservices',
    Svg: require('@site/static/img/services-icon.svg').default,
    description: (
      <>
        Built with a comprehensive microservices architecture covering authentication,
        products, orders, payments, shipping, and more. Each service is independently
        deployable and scalable.
      </>
    ),
  },
  {
    title: 'Cloud-Native & Scalable',
    Svg: require('@site/static/img/cloud-icon.svg').default,
    description: (
      <>
        Designed for cloud deployment with Docker, Kubernetes, and modern DevOps practices.
        Features service discovery, API gateway, distributed caching, and event-driven architecture.
      </>
    ),
  },
  {
    title: 'Production-Ready',
    Svg: require('@site/static/img/production-icon.svg').default,
    description: (
      <>
        Complete with monitoring, logging, distributed tracing, security, and automated testing.
        Includes 14 common libraries for code reuse and consistency across all services.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
