// Animated Git-style branch lines background
(function () {
  const canvas = document.getElementById("git-branches-canvas");
  const ctx = canvas.getContext("2d");

  const COLORS = ["#5a9e1b", "#78c832", "#3d6e12", "#a8d660", "#2e5c0e"];
  const NODE_RADIUS = 5;
  const BRANCH_COUNT = 5;
  const SPEED = 0.4;
  const BRANCH_SPAWN_MIN = 0.4;
  const BRANCH_SPAWN_RANGE = 0.3;
  const BRANCH_MAX_DEPTH = 3;
  const COMMIT_DOT_INTERVAL = 30;

  let branches = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function createBranch(x, y, angle, depth) {
    return {
      x,
      y,
      angle,
      depth,
      progress: 0,
      length: 80 + Math.random() * 120,
      color: randomColor(),
      lineWidth: Math.max(1, 3 - depth * 0.6),
      speed: SPEED * (0.5 + Math.random() * 0.8),
      nodes: [{ x, y }],
      children: [],
      spawned: false,
    };
  }

  function initBranches() {
    branches = [];
    for (let i = 0; i < BRANCH_COUNT; i++) {
      const x = (canvas.width / (BRANCH_COUNT + 1)) * (i + 1);
      const y = -20;
      branches.push(createBranch(x, y, Math.PI / 2, 0));
    }
  }

  function updateBranch(branch) {
    if (branch.progress < branch.length) {
      branch.progress += branch.speed;
      const t = branch.progress / branch.length;
      const nx = branch.x + Math.cos(branch.angle) * branch.progress;
      const ny = branch.y + Math.sin(branch.angle) * branch.progress;
      branch.nodes.push({ x: nx, y: ny });

      // Spawn child branches at midpoint if not yet spawned
      if (!branch.spawned && t > BRANCH_SPAWN_MIN + Math.random() * BRANCH_SPAWN_RANGE && branch.depth < BRANCH_MAX_DEPTH) {
        branch.spawned = true;
        const spread = (Math.PI / 8) + Math.random() * (Math.PI / 8);
        branch.children.push(
          createBranch(nx, ny, branch.angle - spread, branch.depth + 1)
        );
        if (Math.random() > 0.4) {
          branch.children.push(
            createBranch(nx, ny, branch.angle + spread, branch.depth + 1)
          );
        }
      }
    }

    branch.children.forEach(updateBranch);

    // Reset branch when it goes off-screen
    const tip = branch.nodes[branch.nodes.length - 1];
    if (tip && tip.y > canvas.height + 40) {
      const startX = 50 + Math.random() * (canvas.width - 100);
      Object.assign(branch, createBranch(startX, -20, Math.PI / 2 + (Math.random() - 0.5) * 0.4, 0));
    }
  }

  function drawBranch(branch) {
    if (branch.nodes.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = branch.color;
    ctx.lineWidth = branch.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.moveTo(branch.nodes[0].x, branch.nodes[0].y);
    for (let i = 1; i < branch.nodes.length; i++) {
      ctx.lineTo(branch.nodes[i].x, branch.nodes[i].y);
    }
    ctx.stroke();

    // Draw nodes (commit dots) at regular intervals
    branch.nodes.forEach((node, i) => {
      if (i % COMMIT_DOT_INTERVAL === 0 && i > 0) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = branch.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS - 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    });

    branch.children.forEach(drawBranch);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    branches.forEach(updateBranch);
    branches.forEach(drawBranch);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    resize();
    initBranches();
  });

  resize();
  initBranches();
  animate();
})();
