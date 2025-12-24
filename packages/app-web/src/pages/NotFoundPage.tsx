/**
 * 404 页面
 */

import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '50px 0', textAlign: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={
          <Button type="primary" icon={<Home size={16} />} onClick={() => navigate('/home')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}
