import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
  type Difficulty = {
    #easy;
    #medium;
    #hard;
  };

  type Category = {
    #generalKnowledge;
    #sports;
    #bollywood;
    #science;
  };

  type GameProfile = {
    name : Text;
    questionsAnswered : Nat;
    correctAnswers : Nat;
    totalEarnings : Int; // In paise
  };

  type Question = {
    id : Nat;
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
    category : Category;
    difficulty : Difficulty;
  };

  module GameProfile {
    public func compare(profile1 : GameProfile, profile2 : GameProfile) : Order.Order {
      Int.compare(profile2.totalEarnings, profile1.totalEarnings);
    };
  };

  // Storage
  let gameProfiles = Map.empty<Text, GameProfile>();
  let questions = Map.empty<Nat, Question>();
  var questionIdCounter = 0;

  // User Management
  public shared ({ caller }) func register(name : Text) : async () {
    if (gameProfiles.containsKey(name)) {
      Runtime.trap("Profile already exists");
    };

    let profile : GameProfile = {
      name;
      questionsAnswered = 0;
      correctAnswers = 0;
      totalEarnings = 0;
    };
    gameProfiles.add(name, profile);
  };

  // Question Management
  public shared ({ caller }) func addQuestion(
    questionText : Text,
    options : [Text],
    correctAnswerIndex : Nat,
    category : Category,
    difficulty : Difficulty,
  ) : async () {
    let question : Question = {
      id = questionIdCounter;
      questionText = questionText;
      options = options;
      correctAnswerIndex = correctAnswerIndex;
      category = category;
      difficulty = difficulty;
    };
    questions.add(questionIdCounter, question);
    questionIdCounter += 1;
  };

  // Answer Question
  public shared ({ caller }) func answerQuestion(name : Text, questionId : Nat, answerIndex : Nat) : async Bool {
    switch (gameProfiles.get(name)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        switch (questions.get(questionId)) {
          case (null) { Runtime.trap("Question not found") };
          case (?question) {
            let isCorrect = answerIndex == question.correctAnswerIndex;
            let reward = switch (question.difficulty) {
              case (#easy) { 1000 };
              case (#medium) { 2000 };
              case (#hard) { 5000 };
            };

            let updatedProfile : GameProfile = {
              profile with
              questionsAnswered = profile.questionsAnswered + 1;
              correctAnswers = if (isCorrect) { profile.correctAnswers + 1 } else {
                profile.correctAnswers;
              };
              totalEarnings = if (isCorrect) { profile.totalEarnings + reward } else {
                profile.totalEarnings;
              };
            };

            gameProfiles.add(name, updatedProfile);
            isCorrect;
          };
        };
      };
    };
  };

  // Get Top Players
  public query ({ caller }) func getTopPlayers() : async [GameProfile] {
    let profileArray = gameProfiles.values().toArray();
    let sortedProfiles = profileArray.sort();
    let length = sortedProfiles.size();
    if (length <= 10) {
      sortedProfiles;
    } else {
      sortedProfiles.sliceToArray(0, 10);
    };
  };

  // Get All Questions
  public query ({ caller }) func getAllQuestions() : async [Question] {
    questions.values().toArray();
  };

  // Get Profile
  public query ({ caller }) func getProfile(name : Text) : async GameProfile {
    switch (gameProfiles.get(name)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func isUserAlreadyRegistered(userName : Text) : async Bool {
    gameProfiles.containsKey(userName);
  };
};
