import { readFileSync } from 'fs';
import { join } from 'path';

const analyzeBundle = () => {
  const distPath = join(process.cwd(), 'dist');
  const assetsPath = join(distPath, 'assets');
  
  console.log('📊 Bundle Analysis Report');
  console.log('========================\n');
  
  // Read and analyze main bundle
  try {
    const manifest = JSON.parse(readFileSync(join(distPath, '.vite', 'manifest.json'), 'utf8'));
    
    console.log('📦 Entry Points:');
    Object.entries(manifest).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.file}`);
    });
    
    console.log('\n📏 Size Analysis:');
    const assets = readFileSync(assetsPath).toString().split('\n');
    
    assets.forEach(asset => {
      if (asset.includes('.js') || asset.includes('.css')) {
        const size = readFileSync(join(assetsPath, asset)).length;
        const sizeKB = (size / 1024).toFixed(2);
        const sizeMB = (size / 1024 / 1024).toFixed(2);
        
        console.log(`  ${asset}: ${sizeKB} KB (${sizeMB} MB)`);
        
        if (size > 500 * 1024) {
          console.log(`    ⚠️  Large chunk detected! Consider splitting.`);
        }
      }
    });
    
  } catch (error) {
    console.log('❌ Could not read manifest. Run build first.');
  }
  
  console.log('\n🔧 Optimization Recommendations:');
  console.log('  1. Use dynamic imports for heavy components');
  console.log('  2. Implement route-based code splitting');
  console.log('  3. Consider tree shaking unused dependencies');
  console.log('  4. Use manualChunks for vendor libraries');
  console.log('  5. Enable compression for production');
};

analyzeBundle();
