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
      stamina
      maxStamina
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
      spiralLayers
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
      spiralLayers
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
      multiplier
      isPerfect
      correctCount
      totalQuestions
      perfectStreak
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
      multiplier
      isPerfect
      correctCount
      perfectStreak
    }
  }
`;

// ==================== MVP2: DAILY STORY UNLOCK ====================

export const GET_AVAILABLE_STORIES = gql`
  query GetAvailableStories {
    availableStories {
      id
      day
      titleVietnamese
      titleEnglish
      content
      category
      era
      provinceId
      heroId
      baseGoldReward
      baseRiceReward
      baseWoodReward
      isUnlocked
      daysUntilUnlock
      isCompleted
      daysSinceRegistration
      createdAt
      updatedAt
    }
  }
`;

// ==================== PLAYER DATA MANAGEMENT ====================

export const RESET_PLAYER_DATA = gql`
  mutation ResetPlayerData {
    resetPlayerData {
      success
      message
    }
  }
`;

// ========================================
// MVP2 SPRINT 2: PROVINCE SKILLS QUERIES
// ========================================

export const GET_PROVINCE_WITH_SKILLS = gql`
  query GetProvinceWithSkills($provinceId: Int!) {
    provinceWithSkills(provinceId: $provinceId) {
      id
      playerId
      provinceId
      farmerLevel
      resourceLevel
      developmentLevel
      buildingsCount
      spiralLayers
      province {
        id
        name
        nameEnglish
        region
        isCapital
      }
      passiveBuffs {
        type
        value
        description
        source
        icon
      }
      activeSkill {
        id
        name
        description
        multiplier
        duration_hours
        cooldown_hours
        icon
      }
      skillCooldown {
        isOnCooldown
        remainingSeconds
        remainingHours
        canUse
      }
      createdAt
      updatedAt
    }
  }
`;

export const USE_PROVINCE_SKILL = gql`
  mutation UseProvinceSkill($provinceId: Int!) {
    useProvinceSkill(provinceId: $provinceId) {
      playerProvince {
        id
        playerId
        provinceId
        farmerLevel
        resourceLevel
        developmentLevel
      }
      skill {
        id
        name
        description
        multiplier
        duration_hours
        cooldown_hours
        icon
      }
      cooldownEnds
      effectEnds
    }
  }
`;

// ==================== MVP2 SPRINT 3: HERO LEVELS & PET SYSTEM ====================

export const MY_HERO_WITH_STATS = gql`
  query MyHeroWithStats($heroId: ID!) {
    myHeroWithStats(heroId: $heroId) {
      id
      playerId
      heroId
      level
      experience
      deployedTo
      acquiredAt
      createdAt
      updatedAt
      stats {
        hp
        attack
        defense
        speed
        level
        baseHP
        baseAttack
        baseDefense
        baseSpeed
      }
      expForNextLevel
      expProgress
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
        baseSpeed
      }
    }
  }
`;

export const MY_HEROES_WITH_STATS = gql`
  query MyHeroesWithStats {
    myHeroesWithStats {
      id
      playerId
      heroId
      level
      experience
      deployedTo
      stats {
        hp
        attack
        defense
        speed
        level
      }
      expForNextLevel
      expProgress
      hero {
        id
        nameVietnamese
        rarity
      }
    }
  }
`;

export const GRANT_EXP_TO_HERO = gql`
  mutation GrantExpToHero($heroId: ID!, $expAmount: Int!) {
    grantExpToHero(heroId: $heroId, expAmount: $expAmount) {
      playerHero {
        id
        level
        experience
      }
      leveledUp
      levelsGained
    }
  }
`;

export const MY_PETS = gql`
  query MyPets {
    myPets {
      id
      playerId
      name
      petType
      rarity
      level
      experience
      acquiredAt
    }
  }
`;

export const MY_PET_WITH_BONUSES = gql`
  query MyPetWithBonuses($petId: ID!) {
    myPetWithBonuses(petId: $petId) {
      id
      playerId
      name
      petType
      rarity
      level
      experience
      acquiredAt
      bonuses {
        attack
        defense
        hp
        goldBonus
        riceBonus
        woodBonus
        stoneBonus
        expBonus
        learningSpeed
        luckBonus
        criticalChance
        speed
        buildingSpeed
        harvestSpeed
        allStats
        icon
        description
      }
    }
  }
`;

export const ASSIGN_PET_TO_HERO = gql`
  mutation AssignPetToHero($petId: ID!, $heroId: ID!) {
    assignPetToHero(petId: $petId, heroId: $heroId) {
      playerHero {
        id
        heroId
        level
      }
      pet {
        id
        name
        petType
      }
      bonuses {
        attack
        defense
        hp
        goldBonus
        expBonus
        icon
        description
      }
    }
  }
`;

export const UNASSIGN_PET_FROM_HERO = gql`
  mutation UnassignPetFromHero($heroId: ID!) {
    unassignPetFromHero(heroId: $heroId)
  }
`;

export const LEVEL_UP_PET = gql`
  mutation LevelUpPet($petId: ID!) {
    levelUpPet(petId: $petId) {
      id
      level
      experience
    }
  }
`;

export const GRANT_EXP_TO_PET = gql`
  mutation GrantExpToPet($petId: ID!, $expAmount: Int!) {
    grantExpToPet(petId: $petId, expAmount: $expAmount) {
      id
      level
      experience
    }
  }
`;

// ==================== MVP2 SPRINT 4: RESOURCE SYNERGY & ERA PROGRESSION ====================

export const MY_RESOURCE_SYNERGIES = gql`
  query MyResourceSynergies {
    myResourceSynergies {
      playerId
      totalProvinces
      activeSynergies {
        sourceResource
        targetResource
        sourceElement
        targetElement
        bonusPercentage
        affectedProvinces
        description
        icon
      }
      totalBonusPercentage
      cycleCompletion
    }
  }
`;

export const WU_XING_CYCLE = gql`
  query WuXingCycle {
    wuXingCycle {
      playerId
      cycleNodes {
        element
        elementName
        emoji
        resource
        resourceNameVN
        nextElement
        nextResource
        isActive
        bonusPercentage
      }
      activeSynergies {
        sourceResource
        targetResource
        description
        icon
        bonusPercentage
      }
      cycleCompletion
      totalBonus
      description
    }
  }
`;

export const PROVINCE_SYNERGY = gql`
  query ProvinceSynergy($provinceId: Int!) {
    provinceSynergy(provinceId: $provinceId) {
      provinceId
      provinceName
      primaryResources
      applicableSynergies {
        sourceResource
        targetResource
        bonusPercentage
        description
        icon
      }
      totalBonus
      hasSynergy
    }
  }
`;

export const MY_CURRENT_ERA = gql`
  query MyCurrentEra {
    myCurrentEra {
      playerId
      currentEra
      eraName
      eraEmoji
      completedStories
      benefits {
        goldBonus
        riceBonus
        woodBonus
        stoneBonus
        expBonus
        unlockHeroes
      }
      isMaxEra
    }
  }
`;

export const ERA_TIMELINE = gql`
  query EraTimeline {
    eraTimeline {
      playerId
      completedStories
      timeline {
        id
        name
        nameEnglish
        description
        emoji
        color
        minStories
        maxStories
        benefits {
          goldBonus
          riceBonus
          woodBonus
          stoneBonus
          expBonus
          unlockHeroes
        }
        landmarks
        isUnlocked
        isCurrent
        progressPercentage
        requiredStories
        remainingStories
      }
      currentEraIndex
    }
  }
`;

export const MY_ERA_BONUSES = gql`
  query MyEraBonuses {
    myEraBonuses {
      playerId
      era
      eraName
      bonuses {
        goldProduction
        riceProduction
        woodProduction
        stoneProduction
        experienceGain
      }
      description
    }
  }
`;

export const UNLOCKABLE_HEROES = gql`
  query UnlockableHeroes {
    unlockableHeroes {
      playerId
      currentEra
      unlockableHeroes {
        id
        name_vietnamese
        era
        rarity
      }
      totalUnlocked
    }
  }
`;

// ==================== PROVINCE DATA (Sprint 5) ====================

export const ALL_PROVINCES = gql`
  query AllProvinces {
    allProvinces {
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
      historicalEras
      unlockOrder
      unlockStoryDay
      isOwned
      ownershipStatus
    }
  }
`;

export const PROVINCES_BY_REGION = gql`
  query ProvincesByRegion($region: String!) {
    provincesByRegion(region: $region) {
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
      historicalEras
      unlockOrder
      unlockStoryDay
      isOwned
      ownershipStatus
    }
  }
`;

export const SEARCH_PROVINCES = gql`
  query SearchProvinces($keyword: String!) {
    searchProvinces(keyword: $keyword) {
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
      historicalEras
      unlockOrder
      unlockStoryDay
      isOwned
      ownershipStatus
    }
  }
`;

export const PROVINCE_DETAIL = gql`
  query ProvinceDetail($provinceId: Int!) {
    provinceDetail(provinceId: $provinceId) {
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
      historicalEras
      unlockOrder
      unlockStoryDay
      isOwned
      ownershipStatus
      playerData {
        farmerLevel
        resourceLevel
        developmentLevel
        buildingsCount
        passiveBuffs
        activeSkillLevel
        deployedHeroId
        deployedHeroName
        deployedHeroEra
        deployedHeroRarity
      }
      productionRates {
        gold
        rice
        wood
        stone
        bazan
      }
      stories {
        id
        titleVietnamese
        day
        isAvailable
      }
    }
  }
`;

export const REGION_STATISTICS = gql`
  query RegionStatistics {
    regionStatistics {
      north {
        total
        owned
        available
        locked
      }
      central {
        total
        owned
        available
        locked
      }
      south {
        total
        owned
        available
        locked
      }
      overall {
        total
        owned
        available
        locked
      }
    }
  }
`;

export const PROVINCE_UNLOCK_INFO = gql`
  query ProvinceUnlockInfo($provinceId: Int!) {
    provinceUnlockInfo(provinceId: $provinceId) {
      provinceId
      provinceName
      unlockOrder
      unlockStoryDay
      requiredStory {
        id
        titleVietnamese
        day
        isAvailable
      }
      isStartingProvince
      requirementsDescription
    }
  }
`;

export const TOTAL_PROVINCE_COUNT = gql`
  query TotalProvinceCount {
    totalProvinceCount
  }
`;

export const MY_PROVINCE_COUNT = gql`
  query MyProvinceCount {
    myProvinceCount
  }
`;

// ==================== ERA 1: RELIC SYSTEM ====================

export const GET_ALL_RELICS = gql`
  query GetAllRelics {
    allRelics {
      id
      name
      era
      rarity
      description
      auraType
      auraValue
      auraRadius
      baseBronzeCost
      baseBazanCost
    }
  }
`;

export const GET_MY_RELICS = gql`
  query GetMyRelics {
    myRelics {
      id
      playerId
      relicId
      provinceId
      placedAt
      relic {
        id
        name
        era
        rarity
        description
        auraType
        auraValue
        auraRadius
      }
    }
  }
`;

export const CRAFT_RELIC = gql`
  mutation CraftRelic($relicId: String!) {
    craftRelic(relicId: $relicId) {
      id
      playerId
      relicId
      relic {
        id
        name
        rarity
      }
    }
  }
`;

export const PLACE_RELIC = gql`
  mutation PlaceRelic($playerRelicId: String!, $provinceId: Int!) {
    placeRelic(playerRelicId: $playerRelicId, provinceId: $provinceId) {
      id
      playerId
      provinceId
      placedAt
      relic {
        id
        name
      }
    }
  }
`;

export const UPGRADE_SPIRAL = gql`
  mutation UpgradeSpiral($provinceId: Int!) {
    upgradeSpiral(provinceId: $provinceId) {
      id
      provinceId
      spiralLayers
    }
  }
`;

// ==================== ERA 1: CRAFTING SYSTEM ====================

export const GET_CRAFTABLE_ITEMS = gql`
  query GetCraftableItems {
    craftableItems {
      id
      nameVietnamese
      description
      itemType
      rarity
      staminaRestore
      luckBonus
      baseBronzeCost
      baseRiceCost
      baseWoodCost
      isCraftable
    }
  }
`;

export const GET_MY_INVENTORY = gql`
  query GetMyInventory {
    myInventory {
      id
      itemId
      quantity
      item {
        id
        nameVietnamese
        description
        itemType
        rarity
        staminaRestore
        luckBonus
      }
    }
  }
`;

export const CRAFT_ITEM = gql`
  mutation CraftItem($itemId: String!) {
    craftItem(itemId: $itemId) {
      id
      itemId
      quantity
      item {
        id
        nameVietnamese
      }
    }
  }
`;

export const USE_ITEM = gql`
  mutation UseItem($itemId: String!) {
    useItem(itemId: $itemId)
  }
`;

// ==================== ERA 1: EVENT SYSTEM ====================

export const GET_ACTIVE_EVENTS = gql`
  query GetActiveEvents {
    activeEvents {
      id
      name
      description
      eventType
      startDate
      endDate
      isActive
      metadata
    }
  }
`;

export const GET_MY_PARTICIPATION = gql`
  query GetMyParticipation($eventId: String!) {
    myParticipation(eventId: $eventId) {
      id
      choice
      contributionPoints
      rewardsClaimed
      event {
        id
        name
        metadata
      }
    }
  }
`;

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: String!, $choice: String!) {
    joinEvent(eventId: $eventId, choice: $choice) {
      id
      choice
      contributionPoints
    }
  }
`;

export const CONTRIBUTE_TO_EVENT = gql`
  mutation ContributeToEvent($eventId: String!, $amount: Int!) {
    contributeToEvent(eventId: $eventId, amount: $amount) {
      id
      contributionPoints
    }
  }
`;
