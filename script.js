class ExpenseTracker {
  constructor() {
    this.expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    this.budget = parseFloat(localStorage.getItem("monthlyBudget") || "0");
    this.categoryKeywords = {
      "Food & Dining": [
        "coffee",
        "restaurant",
        "food",
        "lunch",
        "dinner",
        "breakfast",
        "pizza",
        "burger",
        "starbucks",
        "mcdonalds",
        "grocery",
        "supermarket",
      ],
      Transportation: [
        "gas",
        "fuel",
        "uber",
        "lyft",
        "taxi",
        "bus",
        "train",
        "parking",
        "metro",
        "subway",
      ],
      Shopping: [
        "amazon",
        "target",
        "walmart",
        "clothes",
        "clothing",
        "shoes",
        "shopping",
        "purchase",
      ],
      "Bills & Utilities": [
        "electric",
        "electricity",
        "water",
        "internet",
        "phone",
        "rent",
        "mortgage",
        "insurance",
      ],
      Healthcare: [
        "doctor",
        "pharmacy",
        "medicine",
        "hospital",
        "dentist",
        "medical",
      ],
      Education: [
        "books",
        "tuition",
        "school",
        "university",
        "course",
        "textbook",
        "supplies",
      ],
      Entertainment: [
        "movie",
        "cinema",
        "netflix",
        "spotify",
        "game",
        "concert",
        "theater",
      ],
      "Personal Care": [
        "haircut",
        "salon",
        "cosmetics",
        "shampoo",
        "toothpaste",
        "soap",
      ],
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setTodaysDate();
    this.updateDisplay();
    this.updateBudgetDisplay();
  }

  setupEventListeners() {
    document.getElementById("expenseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addExpense();
    });

    document.getElementById("description").addEventListener("input", (e) => {
      this.autoSuggestCategory(e.target.value);
    });
  }

  setTodaysDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
  }

  autoSuggestCategory(description) {
    const desc = description.toLowerCase();
    const categorySelect = document.getElementById("category");

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some((keyword) => desc.includes(keyword))) {
        categorySelect.value = category;
        categorySelect.style.borderColor = "#4facfe";
        break;
      }
    }
  }

  addExpense() {
    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const expense = {
      id: Date.now(),
      amount,
      description,
      category,
      date,
      timestamp: new Date(),
    };

    this.expenses.unshift(expense);
    this.saveData();
    this.updateDisplay();
    this.clearForm();
    this.showNotification("Expense added successfully!");
  }

  deleteExpense(id) {
    this.expenses = this.expenses.filter((expense) => expense.id !== id);
    this.saveData();
    this.updateDisplay();
    this.showNotification("Expense deleted successfully!");
  }

  setBudget() {
    const budgetAmount = parseFloat(
      document.getElementById("budgetAmount").value
    );
    if (budgetAmount > 0) {
      this.budget = budgetAmount;
      localStorage.setItem("monthlyBudget", budgetAmount.toString());
      this.updateBudgetDisplay();
      this.showNotification("Budget set successfully!");
    }
  }

  getCurrentMonthExpenses() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  }

  updateDisplay() {
    this.updateStats();
    this.updateExpenseList();
    this.updateCategoryBreakdown();
    this.updateInsights();
    this.updateBudgetDisplay();
  }

  updateStats() {
    const monthlyExpenses = this.getCurrentMonthExpenses();
    const totalSpent = monthlyExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const avgDaily =
      monthlyExpenses.length > 0 ? totalSpent / new Date().getDate() : 0;

    const categoryTotals = {};
    monthlyExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce(
      (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),
      "-"
    );

    document.getElementById("totalSpent").textContent = `$${totalSpent.toFixed(
      2
    )}`;
    document.getElementById("avgDaily").textContent = `$${avgDaily.toFixed(2)}`;
    document.getElementById("totalExpenses").textContent =
      monthlyExpenses.length;
    document.getElementById("topCategory").textContent = topCategory;
  }

  updateExpenseList() {
    const expenseList = document.getElementById("expenseList");
    const recentExpenses = this.expenses.slice(0, 10);

    if (recentExpenses.length === 0) {
      expenseList.innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 48px;">📊</div>
                            <h3>No expenses yet</h3>
                            <p>Start tracking your expenses to see them here</p>
                        </div>
                    `;
      return;
    }

    expenseList.innerHTML = recentExpenses
      .map(
        (expense) => `
                    <div class="expense-item">
                        <div class="expense-details">
                            <div class="expense-amount">$${expense.amount.toFixed(
                              2
                            )}</div>
                            <div class="expense-description">${
                              expense.description
                            }</div>
                            <div>
                                <span class="expense-category">${
                                  expense.category
                                }</span>
                                <span class="expense-date">${new Date(
                                  expense.date
                                ).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="tracker.deleteExpense(${
                          expense.id
                        })">
                            Delete
                        </button>
                    </div>
                `
      )
      .join("");
  }

  updateCategoryBreakdown() {
    const monthlyExpenses = this.getCurrentMonthExpenses();
    const categoryTotals = {};

    monthlyExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const totalAmount = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );
    const categoryList = document.getElementById("categoryList");

    if (totalAmount === 0) {
      categoryList.innerHTML =
        '<p style="text-align: center; color: #666;">No expenses this month</p>';
      return;
    }

    categoryList.innerHTML = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => {
        const percentage = (amount / totalAmount) * 100;
        return `
                            <div class="category-item">
                                <div>
                                    <div class="category-name">${category}</div>
                                    <div class="category-bar">
                                        <div class="category-fill" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                                <div class="category-amount">$${amount.toFixed(
                                  2
                                )}</div>
                            </div>
                        `;
      })
      .join("");
  }

  updateBudgetDisplay() {
    const budgetDisplay = document.getElementById("budgetDisplay");

    if (this.budget === 0) {
      budgetDisplay.innerHTML = '<p style="color: #666;">No budget set</p>';
      return;
    }

    const monthlyExpenses = this.getCurrentMonthExpenses();
    const totalSpent = monthlyExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const remaining = this.budget - totalSpent;
    const percentageUsed = (totalSpent / this.budget) * 100;

    let statusClass = "budget-good";
    let statusMessage = "You're doing great!";

    if (percentageUsed > 80) {
      statusClass = "budget-danger";
      statusMessage = "Warning: Budget almost exceeded!";
    } else if (percentageUsed > 60) {
      statusClass = "budget-warning";
      statusMessage = "Caution: Over 60% of budget used";
    }

    budgetDisplay.innerHTML = `
                    <div style="margin-bottom: 15px;">
                        <strong>Monthly Budget: $${this.budget.toFixed(
                          2
                        )}</strong><br>
                        <span style="color: #666;">Spent: $${totalSpent.toFixed(
                          2
                        )} (${percentageUsed.toFixed(1)}%)</span><br>
                        <span style="color: ${
                          remaining >= 0 ? "#28a745" : "#dc3545"
                        };">
                            Remaining: $${remaining.toFixed(2)}
                        </span>
                    </div>
                    <div class="budget-status ${statusClass}">
                        ${statusMessage}
                    </div>
                `;
  }

  updateInsights() {
    const monthlyExpenses = this.getCurrentMonthExpenses();
    const insights = this.generateInsights(monthlyExpenses);
    const insightsList = document.getElementById("insightsList");

    insightsList.innerHTML = insights
      .map(
        (insight) => `
                    <div class="insight-item">
                        <div class="insight-title">${insight.title}</div>
                        <div>${insight.description}</div>
                    </div>
                `
      )
      .join("");
  }

  generateInsights(expenses) {
    const insights = [];

    if (expenses.length === 0) {
      return [
        {
          title: "🌟 Start Your Journey",
          description:
            "Begin tracking your expenses to unlock personalized insights and savings tips!",
        },
      ];
    }

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = totalSpent / expenses.length;

    // Category analysis
    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (topCategory && topCategory[1] > totalSpent * 0.3) {
      insights.push({
        title: "🎯 Top Spending Alert",
        description: `You're spending ${(
          (topCategory[1] / totalSpent) *
          100
        ).toFixed(1)}% of your budget on ${
          topCategory[0]
        }. Consider setting a specific limit for this category.`,
      });
    }

    // Spending pattern analysis
    const dailySpending = {};
    expenses.forEach((exp) => {
      const day = new Date(exp.date).getDay();
      dailySpending[day] = (dailySpending[day] || 0) + exp.amount;
    });

    const weekendSpending = (dailySpending[0] || 0) + (dailySpending[6] || 0);
    const weekdaySpending = totalSpent - weekendSpending;

    if (weekendSpending > weekdaySpending && expenses.length > 5) {
      insights.push({
        title: "🎉 Weekend Spender",
        description:
          "You tend to spend more on weekends. Planning weekend activities in advance could help manage costs.",
      });
    }

    // Budget comparison
    if (this.budget > 0) {
      const percentageUsed = (totalSpent / this.budget) * 100;
      if (percentageUsed > 50) {
        const daysLeft =
          new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          ).getDate() - new Date().getDate();
        const recommendedDaily = (this.budget - totalSpent) / daysLeft;

        insights.push({
          title: "💡 Budget Pacing",
          description: `To stay within budget, try to spend no more than $${recommendedDaily.toFixed(
            2
          )} per day for the rest of the month.`,
        });
      }
    }

    // Savings opportunity
    if (categoryTotals["Food & Dining"] > 200) {
      insights.push({
        title: "🍕 Dining Savings Tip",
        description:
          "Consider meal prepping or cooking at home more often. You could save $50-100 monthly on dining expenses!",
      });
    }

    // Positive reinforcement
    if (this.budget > 0 && totalSpent < this.budget * 0.8) {
      insights.push({
        title: "🌟 Great Job!",
        description:
          "You're staying well within your budget. Keep up the excellent financial discipline!",
      });
    }

    return insights.length > 0
      ? insights
      : [
          {
            title: "📊 Building Insights",
            description:
              "Keep adding expenses to unlock more personalized insights and savings recommendations!",
          },
        ];
  }

  clearForm() {
    document.getElementById("expenseForm").reset();
    this.setTodaysDate();
  }

  saveData() {
    localStorage.setItem("expenses", JSON.stringify(this.expenses));
  }

  showNotification(message) {
    // Simple notification - could be enhanced with a toast library
    const notification = document.createElement("div");
    notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4facfe;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 1000;
                    font-weight: 600;
                `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Global functions for HTML onclick events
function setBudget() {
  const budgetAmount = parseFloat(
    document.getElementById("budgetAmount").value
  );
  if (budgetAmount > 0) {
    tracker.budget = budgetAmount;
    localStorage.setItem("monthlyBudget", budgetAmount.toString());
    tracker.updateBudgetDisplay();
    tracker.showNotification("Budget set successfully!");
    document.getElementById("budgetAmount").value = "";
  }
}

// Initialize the app
const tracker = new ExpenseTracker();
