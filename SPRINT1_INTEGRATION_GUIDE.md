# 🔗 HƯỚNG DẪN TÍCH HỢP SPRINT 1

## Quick Start - Để sử dụng các components đã tạo

### 1. Kiểm tra Backend đang chạy

```bash
# Check backend status
curl http://localhost:3000/graphql

# Nếu chưa chạy:
cd /chikiet/kataoffical/katagame/backend
npm run dev
```

Backend phải chạy ở `http://localhost:3000/graphql` ✅

### 2. Tạo Story Page trong Frontend

**Option A: Tạo page riêng cho Stories**

```bash
# Create stories page
mkdir -p /chikiet/kataoffical/katagame/frontend/app/stories
```

Tạo file `frontend/app/stories/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StoryList from '@/components/stories/StoryList';
import { StoryWithUnlockStatus } from '@/lib/types/mvp1.types';

export default function StoriesPage() {
  const router = useRouter();

  const handleSelectStory = (story: StoryWithUnlockStatus) => {
    if (story.isUnlocked) {
      // Navigate to story detail page
      router.push(`/stories/${story.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            📚 Câu chuyện lịch sử
          </h1>
          <p className="text-gray-300">
            Mỗi ngày mở khóa 1 truyện mới. Trả lời đúng hết để nhận x5 phần thưởng!
          </p>
        </div>

        {/* Story List */}
        <StoryList onSelectStory={handleSelectStory} />
      </div>
    </div>
  );
}
```

### 3. Tạo Story Detail Page

Tạo file `frontend/app/stories/[id]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/gameStore';
import apolloClient from '@/lib/apolloClient';
import { gql } from '@apollo/client';
import QuizForm from '@/components/stories/QuizForm';
import { QuizSubmissionResult } from '@/lib/types/mvp1.types';

const GET_STORY = gql`
  query GetStory($id: String!) {
    story(id: $id) {
      id
      day
      titleVietnamese
      content
      category
      era
      baseGoldReward
      baseRiceReward
      baseWoodReward
    }
  }
`;

const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions($storyId: String!) {
    quizQuestions(storyId: $storyId) {
      id
      questionNumber
      question
      options
    }
  }
`;

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addResources } = useGameStore();
  
  const [story, setStory] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [params.id]);

  const loadStory = async () => {
    try {
      const [storyRes, questionsRes] = await Promise.all([
        apolloClient.query({
          query: GET_STORY,
          variables: { id: params.id },
        }),
        apolloClient.query({
          query: GET_QUIZ_QUESTIONS,
          variables: { storyId: params.id },
        }),
      ]);

      setStory(storyRes.data.story);
      setQuestions(questionsRes.data.quizQuestions);
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: QuizSubmissionResult) => {
    // Update player resources
    addResources({
      gold: result.rewards.gold,
      rice: result.rewards.rice,
      wood: result.rewards.wood || 0,
    });

    // Show success message and redirect
    alert(`Hoàn thành! Nhận ${result.rewards.gold} vàng ${result.isPerfect ? '(x5!)' : ''}`);
    router.push('/stories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {!showQuiz ? (
          /* Story Content */
          <div className="space-y-6">
            {/* Story Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-500/20 px-3 py-1 rounded text-sm font-bold text-yellow-400">
                  Ngày {story.day}
                </span>
                {story.era && (
                  <span className="bg-purple-500/20 px-3 py-1 rounded text-sm text-purple-300">
                    {story.era}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {story.titleVietnamese}
              </h1>
              <p className="text-gray-400">{story.category}</p>
            </div>

            {/* Story Body */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                  {story.content}
                </p>
              </div>
            </div>

            {/* Quiz Button */}
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-bold text-lg text-white transition-all"
            >
              🎯 Làm bài kiểm tra (Nhận phần thưởng!)
            </button>
          </div>
        ) : (
          /* Quiz Form */
          <div>
            <button
              onClick={() => setShowQuiz(false)}
              className="mb-4 text-gray-400 hover:text-white"
            >
              ← Quay lại đọc truyện
            </button>
            <QuizForm
              storyId={story.id}
              questions={questions}
              onComplete={handleQuizComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Thêm Navigation Link

Trong `frontend/components/MobileNavigation.tsx` hoặc main menu:

```typescript
<Link
  href="/stories"
  className="flex flex-col items-center gap-1 text-gray-400 hover:text-yellow-400"
>
  <Book className="w-6 h-6" />
  <span className="text-xs">Truyện</span>
</Link>
```

### 5. Test Flow

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Start frontend (new terminal)
cd frontend && npm run dev

# 3. Open browser
http://localhost:3001

# 4. Navigate
Main Menu → Stories → Select Story → Read → Quiz → Result
```

---

## 🧪 Manual Testing Checklist

### Test 1: Story List Display
- [ ] Load `/stories` page
- [ ] Verify unlocked stories show với full colors
- [ ] Verify locked stories show với 🔒 và countdown
- [ ] Check responsive: Mobile (1 col) → Tablet (2 col) → Desktop (3 col)

### Test 2: Story Unlock Logic
- [ ] Player mới đăng ký → Chỉ Story Day 1 unlock
- [ ] Wait 1 day → Story Day 2 unlock
- [ ] Verify countdown giảm đúng: "Còn X ngày"

### Test 3: Quiz Perfect Score (x5)
- [ ] Read story → Start quiz
- [ ] Verify indicator: "🎁 Trả lời đúng tất cả = x5!"
- [ ] Answer all correct → Submit
- [ ] ✅ Check confetti shows
- [ ] ✅ Check multiplier badge: "x5"
- [ ] ✅ Check rewards: 500 vàng (= 100 × 5)
- [ ] ✅ Check streak: "🔥 Chuỗi hoàn hảo: 1 lần!"

### Test 4: Quiz Non-Perfect Score (x1)
- [ ] Answer 1 wrong → Submit
- [ ] ✅ NO confetti
- [ ] ✅ Check multiplier badge: "x1"
- [ ] ✅ Check rewards: 100 vàng (normal)
- [ ] ✅ Check streak reset to 0

### Test 5: Perfect Streak Tracking
- [ ] Complete 3 perfect quizzes in a row
- [ ] After 3rd: Check "🔥 Chuỗi hoàn hảo: 3 lần!"
- [ ] Do 1 non-perfect → Verify streak resets to 0
- [ ] Check database: `player_stats.quiz_best_streak = 3`

### Test 6: Story Completed Badge
- [ ] Complete quiz for Story Day 1
- [ ] Go back to story list
- [ ] ✅ Verify Story Day 1 shows ✅ badge
- [ ] ✅ Verify no more "🎁 x5!" indicator (already completed)

---

## 🗄️ Database Verification

```sql
-- Check player registration date
SELECT username, registration_date, created_at 
FROM players 
WHERE id = 'YOUR_PLAYER_ID';

-- Check quiz submissions with multiplier
SELECT 
  s.title_vietnamese,
  qs.score,
  qs.max_score,
  qs.multiplier,
  qs.rewards
FROM quiz_submissions qs
JOIN stories s ON qs.story_id = s.id
WHERE qs.player_id = 'YOUR_PLAYER_ID'
ORDER BY qs.submitted_at DESC;

-- Check perfect streak
SELECT 
  quiz_perfect_streak,
  quiz_best_streak,
  perfect_quizzes,
  quizzes_taken
FROM player_stats
WHERE player_id = 'YOUR_PLAYER_ID';

-- Check available stories for player
SELECT 
  day,
  title_vietnamese,
  CURRENT_DATE - registration_date as days_since_reg
FROM stories, players
WHERE players.id = 'YOUR_PLAYER_ID'
ORDER BY day;
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module '@/components/stories/StoryList'"

**Solution**:
```bash
# Verify files exist
ls frontend/components/stories/
# Should show: StoryList.tsx, QuizForm.tsx

# If missing, files are in the project but need to be committed
```

### Problem: "Error: useQuery is not a function"

**Cause**: Đã fix trong code - dùng `apolloClient.query()` thay vì `useQuery`

### Problem: "GraphQL error: Unauthorized"

**Solution**:
```typescript
// Make sure auth token is set
localStorage.setItem('authToken', 'YOUR_TOKEN');

// Or login first
await apolloClient.mutate({
  mutation: LOGIN,
  variables: { email: 'test@example.com', password: 'password' }
});
```

### Problem: Confetti không hiển thị

**Solution**:
```bash
# Install dependency
cd frontend
npm install react-confetti

# Restart dev server
npm run dev
```

### Problem: Countdown không update

**Cause**: Component cần re-render
**Solution**: Đã có `setInterval(loadStories, 60000)` trong code - sẽ update mỗi phút

---

## 📦 Dependencies Check

Verify tất cả packages đã cài:

```json
{
  "@apollo/client": "^4.0.8",
  "framer-motion": "^latest",
  "react-confetti": "^6.1.0",  // ✅ Vừa cài
  "lucide-react": "^latest"
}
```

---

## 🎯 Success Criteria

**Sprint 1 Integration Complete khi**:
- ✅ `/stories` page hoạt động
- ✅ Story list hiển thị locked/unlocked đúng
- ✅ Quiz form submit thành công
- ✅ Perfect quiz → Confetti + x5 rewards
- ✅ Non-perfect quiz → x1 rewards
- ✅ Streak tracking hoạt động
- ✅ Daily unlock countdown đúng
- ✅ Mobile responsive

---

**Estimated Integration Time**: 30-60 phút
**Current Status**: Components sẵn sàng, chỉ cần tạo pages và import!
