import React, { ReactNode } from 'react';
import Layout from './Layout';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  transparentHeader?: boolean;
  hideFooter?: boolean;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  transparentHeader = false,
  hideFooter = false,
  className = ''
}) => {
  return (
    <Layout className={className}>
      <Header transparent={transparentHeader} />
      <main className={`${transparentHeader ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </Layout>
  );
};

export default PageLayout;