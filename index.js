
import { collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

  let userId;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      console.log("Logged in as:", userId);
      startApp(); // load user-specific data
    } else {
      // Not logged in — redirect to login
      window.location.href = "login.html";
    }
  });
function startApp() {


  // Assume a logged-in user with a known ID for demo
   // Replace dynamically if you have auth


  const coursesContainer = document.getElementById("coursesContainer");
  const totalCreditsElem = document.getElementById("totalCredits");
  const currentCreditsElem = document.getElementById("currentCredits");
  const cgpaElem = document.getElementById("cgpa");

  const addCourseBtn = document.getElementById("addCourseBtn");
  const addCourseModal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const courseStatus = document.getElementById("courseStatus");
  const gradeSection = document.getElementById("gradeSection");
  const assignmentSection = document.getElementById("assignmentSection");
  const assignmentsContainer = document.getElementById("assignmentsContainer");

  // Edit modal elements
  const editAssignmentsModal = document.getElementById("editAssignmentsModal");
  const closeEditModal = document.getElementById("closeEditModal");
  const editAssignmentsForm = document.getElementById("editAssignmentsForm");
  const editAssignmentsContainer = document.getElementById("editAssignmentsContainer");
  const editAddAssignmentBtn = document.getElementById("editAddAssignmentBtn");
  const markCompletedCheckbox = document.getElementById("markCompletedCheckbox");
  const finalGradeSection = document.getElementById("finalGradeSection");
  const finalGradeSelect = document.getElementById("finalGradeSelect");
  const editCourseCodeSpan = document.getElementById("editCourseCode");
  const numericGradeDiv = document.getElementById("numericGradeDisplay");

  let allCourses = [];
  let courseBeingEdited = null;

  async function loadCourses() {
    const snapshot = await getDocs(collection(db, "users", userId, "courses"));
    allCourses = [];
    snapshot.forEach(docSnap => {
      let data = docSnap.data();
      data.id = docSnap.id;
      allCourses.push(data);
    });
    updateProgress();
    renderCourses("all");
  }

  function gradeToGpa(letter) {
    const map = {
      "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D": 1.0, "F": 0
    };
    return map[letter] || 0;
  }

  function calculateAssignmentGrade(assignments) {
    if (!assignments || assignments.length === 0) return null;
    let total = 0;
    assignments.forEach(a => {
      total += (a.score * a.weight) / 100;
    });
    return total;
  }

  function updateProgress() {
    let currentCredits = 0;
    let totalGradePoints = 0;
    let totalCreditsEarned = 0;

    allCourses.forEach(course => {
      if (course.status === "completed") {
        const gpa = gradeToGpa(course.grade);
        currentCredits += course.credits || 0;
        totalGradePoints += gpa * (course.credits || 0);
        totalCreditsEarned += course.credits || 0;
      }
    });

    currentCreditsElem.innerText = currentCredits;
const truncated = Math.floor((totalGradePoints / totalCreditsEarned) * 100) / 100;
cgpaElem.innerText = totalCreditsEarned > 0 ? truncated.toFixed(2) : "0.00";

    // Get totalCredits from user doc
    getDocs(collection(db, "users")).then(users => {
      users.forEach(docSnap => {
        if (docSnap.id === userId) {
          totalCreditsElem.innerText = docSnap.data().totalCredits || 0;
        }
      });
    });
  }
  function semesterToSortable(semesterStr) {
  // Example semesterStr: "Spring 2023", "Fall 2022"
  const [term, yearStr] = semesterStr.split(" ");
  const year = parseInt(yearStr);

  // Encode term so Fall > Spring (Fall = 2, Spring = 1)
  const termOrder = term.toLowerCase() === "fall" ? 2 : 1;

  return { year, termOrder };
}

function compareSemestersDesc(a, b) {
  const semA = semesterToSortable(a.semester);
  const semB = semesterToSortable(b.semester);

  // Compare year descending
  if (semA.year !== semB.year) {
    return semB.year - semA.year;
  }

  // Same year: Fall > Spring, so descending means Fall first
  return semB.termOrder - semA.termOrder;
}

  function createCourseCard(course) {
    const card = document.createElement("div");
    card.classList.add("course-card");

    const banner = document.createElement("div");
    banner.classList.add("card-banner");
    banner.classList.add(course.status === "completed" ? "banner-completed" : "banner-ongoing");
    card.appendChild(banner);

    card.innerHTML += `
      <h3><b>${course.code}</b></h3>
      <p><i>${course.instructor}</i></p>
      <p>${course.name}</p>
      <p>${course.semester}</p>
    `;

    if (course.status === "completed") {
      const grade = document.createElement("div");
      grade.classList.add("grade");
      grade.innerText = course.grade;
      card.appendChild(grade);
    } else {
      // Show current calculated grade from assignments
      const currentGrade = calculateAssignmentGrade(course.assignments);
      const gradeDiv = document.createElement("div");
      gradeDiv.classList.add("grade");
      gradeDiv.innerText = currentGrade !== null ? currentGrade.toFixed(2) + "%" : "N/A";
      card.appendChild(gradeDiv);

      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.innerText = "Edit";
      editBtn.onclick = () => openEditModal(course);
      card.appendChild(editBtn);
    }

    return card;
  }

function renderCourses(filter) {
  coursesContainer.innerHTML = "";

  const filtered = allCourses.filter(course => {
    if (filter === "completed") return course.status === "completed";
    if (filter === "ongoing") return course.status === "ongoing";
    return true;
  });

  filtered.sort(compareSemestersDesc); // Sort descending by semester

  filtered.forEach(course => {
    const card = createCourseCard(course);
    coursesContainer.appendChild(card);
  });
}

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCourses(btn.dataset.filter);
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.toLowerCase();
    if (!query) {
      renderCourses(document.querySelector(".filter-btn.active").dataset.filter);
      return;
    }
    const filtered = allCourses.filter(c => c.code.toLowerCase().includes(query));
    if (filtered.length > 0) {
      coursesContainer.innerHTML = "";
      filtered.forEach(course => {
        const card = createCourseCard(course);
        coursesContainer.appendChild(card);
      });
    } else {
      alert("No courses found.");
    }
  });

  // Add course modal handling
  addCourseBtn.onclick = () => {
    addCourseModal.classList.remove("hidden");
  };

  closeModal.onclick = () => {
    addCourseModal.classList.add("hidden");
    document.getElementById("courseForm").reset();
    gradeSection.classList.add("hidden");
    assignmentSection.classList.add("hidden");
    assignmentsContainer.innerHTML = "";
  };

  courseStatus.onchange = () => {
    const status = courseStatus.value;
    gradeSection.classList.toggle("hidden", status !== "completed");
    assignmentSection.classList.toggle("hidden", status !== "ongoing");
    assignmentsContainer.innerHTML = ""; // clear assignments on status change
  };

  document.getElementById("addAssignmentBtn").onclick = () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <input type="text" placeholder="Assignment Name" required>
      <input type="number" placeholder="Weight (%)" min="0" max="100" required>
      <input type="number" placeholder="Score (%)" min="0" max="100" required>
    `;
    assignmentsContainer.appendChild(container);
  };

  document.getElementById("courseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = document.getElementById("courseCode").value.trim();
    const name = document.getElementById("courseName").value.trim();
    const instructor = document.getElementById("instructor").value.trim();
    const semester = document.getElementById("semester").value.trim();
    const credits = parseInt(document.getElementById("credits").value);
    const status = courseStatus.value;

    let grade = null;
    let assignments = [];

    if (status === "completed") {
      grade = document.getElementById("grade").value;
    } else if (status === "ongoing") {
      const assignmentDivs = assignmentsContainer.querySelectorAll("div");
      assignmentDivs.forEach(div => {
        const inputs = div.querySelectorAll("input");
        assignments.push({
          name: inputs[0].value.trim(),
          weight: parseFloat(inputs[1].value),
          score: parseFloat(inputs[2].value),
        });
      });

      // Validate total assignment weight
      const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
      if (totalWeight !== 100) {
        alert("Total weight of all assignments must equal 100%");
        return;
      }
    }

    const newCourse = {
      code,
      name,
      instructor,
      semester,
      credits,
      status,
      grade,
      assignments,
    };

    try {
      await addDoc(collection(db, "users", userId, "courses"), newCourse);
      alert("Course added successfully!");
      addCourseModal.classList.add("hidden");
      document.getElementById("courseForm").reset();
      gradeSection.classList.add("hidden");
      assignmentSection.classList.add("hidden");
      assignmentsContainer.innerHTML = "";

      await loadCourses();
    } catch (error) {
      alert("Error adding course: " + error.message);
    }
  });

  // Open edit assignments modal
  function openEditModal(course) {
    courseBeingEdited = course;
    editCourseCodeSpan.textContent = course.code;

    // Clear container
    editAssignmentsContainer.innerHTML = "";

    // Populate assignments if any
    if (course.assignments && course.assignments.length > 0) {
      course.assignments.forEach(a => {
        const div = document.createElement("div");
        div.innerHTML = `
          <input type="text" placeholder="Assignment Name" required value="${a.name}" />
          <input type="number" placeholder="Weight (%)" min="0" max="100" required value="${a.weight}" />
          <input type="number" placeholder="Score (%)" min="0" max="100" required value="${a.score}" />
          <button type="button" class="removeAssignmentBtn">Remove</button>
        `;
        editAssignmentsContainer.appendChild(div);

        div.querySelector(".removeAssignmentBtn").onclick = () => {
          div.remove();
          updateNumericGradeDisplay();
        };
      });
    }

    // Show numeric grade
    updateNumericGradeDisplay();

    // Reset checkbox and final grade section
    markCompletedCheckbox.checked = false;
    finalGradeSection.classList.add("hidden");

    editAssignmentsModal.classList.remove("hidden");
  }

  // Update numeric grade display helper
  function updateNumericGradeDisplay() {
    const assignments = [];
    const divs = editAssignmentsContainer.querySelectorAll("div");

    divs.forEach(div => {
      const inputs = div.querySelectorAll("input");
      const name = inputs[0].value.trim();
      const weight = parseFloat(inputs[1].value);
      const score = parseFloat(inputs[2].value);
      if (name && !isNaN(weight) && !isNaN(score)) {
        assignments.push({ name, weight, score });
      }
    });

    const finalPercent = calculateAssignmentGrade(assignments);
    if (finalPercent !== null) {
      numericGradeDiv.innerText = `Numeric Grade: ${finalPercent.toFixed(2)}%`;
    } else {
      numericGradeDiv.innerText = "Numeric Grade: N/A";
    }
  }

  // Add assignment button inside edit modal
  editAddAssignmentBtn.onclick = () => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" placeholder="Assignment Name" required />
      <input type="number" placeholder="Weight (%)" min="0" max="100" required />
      <input type="number" placeholder="Score (%)" min="0" max="100" required />
      <button type="button" class="removeAssignmentBtn">Remove</button>
    `;
    editAssignmentsContainer.appendChild(div);
    div.querySelector(".removeAssignmentBtn").onclick = () => {
      div.remove();
      updateNumericGradeDisplay();
    };

    // Optional: update numeric grade live when inputs change
    const inputs = div.querySelectorAll("input");
    inputs.forEach(input => input.addEventListener("input", updateNumericGradeDisplay));
  };

  // Show/hide final grade selector based on checkbox
  markCompletedCheckbox.onchange = () => {
    if (markCompletedCheckbox.checked) {
      finalGradeSection.classList.remove("hidden");
    } else {
      finalGradeSection.classList.add("hidden");
    }
  };

  // Close edit modal
  closeEditModal.onclick = () => {
    editAssignmentsModal.classList.add("hidden");
    courseBeingEdited = null;
    editAssignmentsContainer.innerHTML = "";
    markCompletedCheckbox.checked = false;
    finalGradeSection.classList.add("hidden");
  };

  // Submit changes in edit modal
  editAssignmentsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const assignments = [];
    const divs = editAssignmentsContainer.querySelectorAll("div");

    for (const div of divs) {
      const inputs = div.querySelectorAll("input");
      const name = inputs[0].value.trim();
      const weight = parseFloat(inputs[1].value);
      const score = parseFloat(inputs[2].value);

      if (!name || isNaN(weight) || isNaN(score)) {
        alert("Please fill all assignment fields correctly.");
        return;
      }

      assignments.push({ name, weight, score });
    }

    // Validate total weight = 100
    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight !== 100) {
      alert("Total weight of all assignments must equal 100%");
      return;
    }

    let updateData = {
      assignments,
    };

    if (markCompletedCheckbox.checked) {
      const finalGrade = finalGradeSelect.value;
      updateData.status = "completed";
      updateData.grade = finalGrade;
    }

    try {
      const courseDocRef = doc(db, "users", userId, "courses", courseBeingEdited.id);
      await updateDoc(courseDocRef, updateData);
      alert("Course updated successfully!");
      editAssignmentsModal.classList.add("hidden");
      courseBeingEdited = null;
      await loadCourses();
    } catch (error) {
      alert("Error updating course: " + error.message);
    }
  });

  // Initial load
  loadCourses();

};
