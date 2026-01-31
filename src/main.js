import App from './App.js';
import './styles/main.css';
import './styles/auth.css';
import './styles/v2-home.css';
import './styles/v2-assets.css';
import './styles/v2-cashflow.css';

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Web3 Budget App 시작');
    
    // 환경 변수 확인
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
        console.warn('📝 .env 파일을 생성하고 다음 변수를 설정하세요:');
        console.warn('   VITE_SUPABASE_URL=your_url');
        console.warn('   VITE_SUPABASE_ANON_KEY=your_key');
        
        // 경고 메시지 표시
        const appContent = document.getElementById('app-content');
        appContent.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #f56565;">
                <h2 style="font-size: 2rem; margin-bottom: 20px;">⚠️ 설정이 필요합니다</h2>
                <div style="background: #fff5f5; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; text-align: left;">
                    <p style="margin-bottom: 20px;">Supabase 환경 변수가 설정되지 않았습니다.</p>
                    <ol style="line-height: 2;">
                        <li>프로젝트 루트에 <code>.env</code> 파일 생성</li>
                        <li>다음 내용 입력:
                            <pre style="background: #2d3748; color: #68d391; padding: 15px; border-radius: 8px; margin-top: 10px;">VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key</pre>
                        </li>
                        <li>개발 서버 재시작: <code>npm run dev</code></li>
                    </ol>
                    <p style="margin-top: 20px;">
                        📖 자세한 설정 방법은 <code>QUICKSTART.md</code> 파일을 참고하세요.
                    </p>
                </div>
            </div>
        `;
        return;
    }
    
    console.log('✅ Supabase 설정 확인됨');
    console.log('🔑 URL:', supabaseUrl);
    
    // 앱 시작
    new App();
});
