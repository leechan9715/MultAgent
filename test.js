// 만약 --run-harness 아규먼트가 있다면 하네스 모드로 실행합니다.
const isHarnessRun = process.argv.includes("--run-harness");

// ==========================================
// [원본 코드 영역 - Codex 수정 대상]
// ==========================================
function processData(items) {
  const promises = items.map((item) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(item.toUpperCase());
      }, 100);
    });
  });
  return Promise.all(promises);
}
// ==========================================

// 원본의 console.log 실행부 (하네스 작동 시에는 본래의 출력을 간섭하지 않도록 제어)
if (!isHarnessRun) {
  console.log(processData(["a", "b"]));
}

// [테스트 하네스 검증 영역 - 절대 수정 금지]
if (isHarnessRun) {
  (async () => {
    console.log("\n[TEST HARNESS START]");
    let pass = true;
    try {
      const resPromise = processData(["a", "b"]);
      if (!(resPromise instanceof Promise)) {
        console.error("FAIL: processData should return a Promise.");
        pass = false;
      } else {
        const res = await resPromise;
        if (!Array.isArray(res) || res.length !== 2 || res[0] !== "A" || res[1] !== "B") {
          console.error("FAIL: Expected output ['A', 'B'], but got: " + JSON.stringify(res));
          pass = false;
        } else {
          console.log("PASS: processData async execution and closure fix");
        }
      }
    } catch (e) {
      console.error("FAIL: Runtime error occurred: " + e.message);
      pass = false;
    }

    if (pass) {
      console.log("[TEST HARNESS RESULTS]: ALL TESTS PASSED SUCCESSFULLY!\n");
      process.exit(0);
    } else {
      console.log("[TEST HARNESS RESULTS]: SOME TESTS FAILED.\n");
      process.exit(1);
    }
  })();
}
