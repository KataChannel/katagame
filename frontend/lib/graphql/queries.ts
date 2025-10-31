import { gql } from '@apollo/client';

// ==================== AUTH ====================

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $username: String!) {
    register(email: $email, password: $password, username: $username) {
      success
      message
      token
      playerId
      username
      level
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      token
      playerId
      username
      level
    }
  }
`;

export const GOOGLE_AUTH = gql`
  mutation GoogleAuth($credential: String!) {
    googleAuth(credential: $credential) {
      success
      message
      token
      playerId
      username
      level
    }
  }
`;

// ==================== PLAYER ====================

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      level
      experience
      resources
      status
      region
      premiumPassActive
      premiumExpiresAt
      lastLogin
      createdAt
      updatedAt
    }
  }
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: String!) {
    player(id: $id) {
      id
      username
      email
      level
      experience
      region
      status
      premiumPassActive
      premiumExpiresAt
      lastLogin
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($data: PlayerUpdateInput!) {
    updatePlayer(data: $data) {
      id
      username
      email
      level
      experience
    }
  }
`;

export const ADD_RESOURCES = gql`
  mutation AddResources(
    $gold: Float
    $rice: Float
    $lumber: Float
    $stone: Float
    $bazan: Float
  ) {
    addResources(
      gold: $gold
      rice: $rice
      lumber: $lumber
      stone: $stone
      bazan: $bazan
    ) {
      success
      message
    }
  }
`;

// ==================== RESOURCES ====================

export const GET_RESOURCES = gql`
  query GetResources {
    resources {
      id
      nameEnglish
      nameVietnamese
      description
      emoji
      elementType
      baseGenerationRate
      baseStorageCapacity
      valuePoints
    }
  }
`;

export const GET_MY_RESOURCES = gql`
  query GetMyResources {
    myResources {
      id
      playerId
      resourceType
      amount
      lastHarvestAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_RESOURCE = gql`
  query GetMyResource($resourceType: String!) {
    myResource(resourceType: $resourceType) {
      id
      playerId
      resourceType
      amount
      lastHarvestAt
      createdAt
      updatedAt
    }
  }
`;

// ==================== PROVINCES ====================

export const GET_PROVINCES = gql`
  query GetProvinces($where: ProvinceWhereInput, $pagination: PaginationInput) {
    provinces(where: $where, pagination: $pagination) {
      id
      name
      nameEnglish
      region
      description
      isCapital
      baseGoldRate
      baseRiceRate
      baseWoodRate
      baseStoneRate
      baseBazanRate
      unlockOrder
      unlockStoryDay
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROVINCE = gql`
  query GetProvince($id: Int!) {
    province(id: $id) {
      id
      name
      nameEnglish
      region
      description
      isCapital
      baseGoldRate
      baseRiceRate
      baseWoodRate
      baseStoneRate
      baseBazanRate
      unlockOrder
      unlockStoryDay
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_PROVINCES = gql`
  query GetMyProvinces($where: PlayerProvinceWhereInput) {
    myProvinces(where: $where) {
      id
      provinceId
      playerId
      farmerLevel
      resourceLevel
      developmentLevel
      buildingsCount
      heroId
      createdAt
      updatedAt
      province {
        id
        name
        region
      }
    }
  }
`;

export const GET_MY_PROVINCE = gql`
  query GetMyProvince($provinceId: Int!) {
    myProvince(provinceId: $provinceId) {
      id
      playerId
      provinceId
      farmerLevel
      resourceLevel
      developmentLevel
      buildingsCount
      heroId
      createdAt
      updatedAt
      province {
        id
        name
        nameEnglish
        region
        baseGoldRate
        baseRiceRate
        baseWoodRate
      }
    }
  }
`;

export const UNLOCK_PROVINCE = gql`
  mutation UnlockProvince($input: UnlockProvinceInput!) {
    unlockProvince(input: $input) {
      id
      playerId
      provinceId
      farmerLevel
      resourceLevel
      developmentLevel
      province {
        id
        name
      }
    }
  }
`;

export const UPGRADE_PROVINCE = gql`
  mutation UpgradeProvince($input: UpgradeProvinceInput!) {
    upgradeProvince(input: $input) {
      id
      playerId
      provinceId
      farmerLevel
      resourceLevel
      developmentLevel
      buildingsCount
      heroId
      province {
        id
        name
        nameEnglish
        region
        description
        unlockOrder
      }
    }
  }
`;

// ==================== HEROES ====================

export const GET_HEROES = gql`
  query GetHeroes($where: HeroWhereInput, $pagination: PaginationInput) {
    heroes(where: $where, pagination: $pagination) {
      id
      nameVietnamese
      nameEnglish
      rarity
      role
      era
      baseAttack
      baseDefense
      baseHp
      baseSpeed
      bonusType
      bonusValue
      petName
      petEmoji
      petBonus
      storyDay
      isAvailable
      isPremium
    }
  }
`;

export const GET_HERO = gql`
  query GetHero($id: String!) {
    hero(id: $id) {
      id
      nameVietnamese
      nameEnglish
      rarity
      role
      era
      baseAttack
      baseDefense
      baseHp
      baseSpeed
      bonusType
      bonusValue
      petName
      petEmoji
      petBonus
      storyDay
      unlockRequirement
      isAvailable
      isPremium
    }
  }
`;

export const GET_MY_HEROES = gql`
  query GetMyHeroes($where: PlayerHeroWhereInput) {
    myHeroes(where: $where) {
      id
      playerId
      heroId
      level
      experience
      deployedTo
      acquiredAt
      hero {
        id
        nameVietnamese
        nameEnglish
        era
        rarity
        role
        baseHp
        baseAttack
        baseDefense
      }
    }
  }
`;

export const GET_MY_HERO = gql`
  query GetMyHero($heroId: String!) {
    myHero(heroId: $heroId) {
      id
      playerId
      heroId
      level
      experience
      deployedTo
      acquiredAt
      hero {
        id
        nameVietnamese
        nameEnglish
        era
        rarity
        role
        baseHp
        baseAttack
        baseDefense
      }
    }
  }
`;

export const RECRUIT_HERO = gql`
  mutation RecruitHero($input: RecruitHeroInput!) {
    recruitHero(input: $input) {
      id
      playerId
      heroId
      level
      experience
      hero {
        id
        nameVietnamese
      }
    }
  }
`;

export const DEPLOY_HERO = gql`
  mutation DeployHero($input: DeployHeroInput!) {
    deployHero(input: $input) {
      id
      playerId
      heroId
      deployedTo
      hero {
        id
        nameVietnamese
      }
    }
  }
`;

export const LEVEL_UP_HERO = gql`
  mutation LevelUpHero($input: LevelUpHeroInput!) {
    levelUpHero(input: $input) {
      id
      playerId
      heroId
      level
      experience
      hero {
        id
        nameVietnamese
      }
    }
  }
`;

// ==================== STORIES ====================

export const GET_STORIES = gql`
  query GetStories($where: StoryWhereInput, $pagination: PaginationInput) {
    stories(where: $where, pagination: $pagination) {
      id
      titleVietnamese
      titleEnglish
      content
      day
      category
      era
      provinceId
      heroId
      readingTimeMinutes
      wordCount
      baseGoldReward
      baseRiceReward
      baseWoodReward
      isAvailable
      isPremium
    }
  }
`;

export const GET_STORY = gql`
  query GetStory($id: String!) {
    story(id: $id) {
      id
      titleVietnamese
      titleEnglish
      content
      day
      category
      era
      provinceId
      heroId
      readingTimeMinutes
      wordCount
      baseGoldReward
      baseRiceReward
      baseWoodReward
      isAvailable
      isPremium
    }
  }
`;

export const GET_STORY_BY_DAY = gql`
  query GetStoryByDay($day: Int!) {
    storyByDay(day: $day) {
      id
      day
      titleVietnamese
      titleEnglish
      content
      category
      era
      provinceId
      heroId
      readingTimeMinutes
      wordCount
      baseGoldReward
      baseRiceReward
      baseWoodReward
      isPremium
      isAvailable
      createdAt
      updatedAt
    }
  }
`;

export const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions($storyId: String!) {
    quizQuestions(storyId: $storyId) {
      id
      storyId
      questionNumber
      question
      options
      correctAnswer
      difficulty
      type
      createdAt
    }
  }
`;

export const MARK_STORY_READ = gql`
  mutation MarkStoryRead($input: MarkStoryReadInput!) {
    markStoryRead(input: $input)
  }
`;

export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($input: SubmitQuizInput!) {
    submitQuiz(input: $input) {
      id
      playerId
      storyId
      score
      maxScore
      answers
      timeTaken
      rewards
      submittedAt
    }
  }
`;

export const GET_MY_QUIZ_SUBMISSIONS = gql`
  query GetMyQuizSubmissions {
    myQuizSubmissions {
      id
      playerId
      storyId
      score
      maxScore
      answers
      timeTaken
      rewards
      submittedAt
    }
  }
`;
