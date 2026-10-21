import { prisma } from "../src/lib/prisma";
import { handleBillingWebhook } from "../src/lib/billing-simulator";
import { handleLmsProgressWebhook, provisionTrialAccount } from "../src/lib/lms-simulator";
import { getStudentEntitlements, issueEntitlement, forceExpireEntitlement, renewEntitlement } from "../src/lib/entitlement";
import { executeMcpTool } from "../src/lib/mcp-core";

async function runTests() {
  console.log("=== STARTING PARTNER SIMULATOR TESTS ===");

  // 1. Prepare an Order for Billing Test
  let order = await prisma.order.findFirst({ where: { status: "PENDING" } });
  if (!order) {
    const course = await prisma.course.findFirst();
    const facility = await prisma.facility.findFirst();
    const student = await prisma.student.findFirst();

    order = await prisma.order.create({
      data: {
        code: `ORD-TEST-${Date.now().toString().slice(-4)}`,
        parentName: "Phụ Huynh Test",
        parentPhone: "0911223344",
        courseId: course!.id,
        facilityId: facility!.id,
        studentId: student!.id,
        amount: 2500000,
        status: "PENDING",
      },
    });
  }

  console.log(`[Test 1] Using Order ${order.code} (Amount: ${order.amount}đ, Status: ${order.status})`);

  // 2. Trigger Billing Payment Confirmation
  const dedupKey = `test_dedup_${Date.now()}`;
  const payResult = await handleBillingWebhook({
    event: "payment_success",
    order_code: order.code,
    transaction_id: `tx_test_${Date.now()}`,
    amount: order.amount,
    currency: "VND",
    payment_method: "BANK_TRANSFER",
    dedup_key: dedupKey,
  });

  console.log("[Test 2] Billing Payment Success Result:", payResult.message);
  if (!payResult.success) throw new Error("Billing test failed!");

  // Verify DB state
  const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
  console.log(`  -> Order status in DB: ${updatedOrder?.status} (Expected: PAID)`);
  if (updatedOrder?.status !== "PAID") throw new Error("Order not marked as PAID!");

  // 3. Test Idempotency
  const dupResult = await handleBillingWebhook({
    event: "payment_success",
    order_code: order.code,
    transaction_id: `tx_test_dup`,
    amount: order.amount,
    dedup_key: dedupKey,
  });
  console.log(`[Test 3] Idempotency Check: isDuplicate=${dupResult.isDuplicate} (Expected: true)`);
  if (!dupResult.isDuplicate) throw new Error("Idempotency failed!");

  // 4. Test LMS First Login
  const student = await prisma.student.findFirst();
  if (!student) throw new Error("No students in DB to test!");

  const lmsLoginResult = await handleLmsProgressWebhook({
    event: "lms.first_login",
    learner_id: student.code,
  });
  console.log(`[Test 4] LMS First Login Result: ${lmsLoginResult.message}`);
  if (!lmsLoginResult.success) throw new Error("LMS First Login failed!");

  // 5. Test LMS Lesson Completed
  const lmsLessonResult = await handleLmsProgressWebhook({
    event: "lms.lesson_completed",
    learner_id: student.code,
    lesson_id: "unit_01",
    lesson_title: "Unit 1: Phonics and Alphabet",
    progress_percent: 100,
  });
  console.log(`[Test 5] LMS Lesson Completed Result: ${lmsLessonResult.message}`);
  if (!lmsLessonResult.success) throw new Error("LMS Lesson Completed failed!");

  // 6. Test Trial Account Provisioning
  const trialResult = await provisionTrialAccount({
    name: "Nguyễn Thử Nghiệm",
    phone: "0977665544",
    trialDays: 7,
  });
  console.log(`[Test 6] Trial Provisioning: Student ${trialResult.student_code}, Token: ${trialResult.trial_token}`);
  if (!trialResult.success) throw new Error("Trial provisioning failed!");

  // 7. Test Entitlement Queries & Renewal
  const entitlements = await getStudentEntitlements(trialResult.learner_id);
  console.log(`[Test 7] Retrieved ${entitlements.length} entitlement(s) for trial student. Days remaining: ${entitlements[0].daysRemaining}`);

  // Test Renew
  const renewed = await renewEntitlement(entitlements[0].id, 30);
  const renewedEnts = await getStudentEntitlements(trialResult.learner_id);
  console.log(`[Test 8] Renewed Entitlement. New days remaining: ${renewedEnts[0].daysRemaining}`);

  // 8. Test MCP Tool check_entitlement
  const mcpResult = await executeMcpTool("check_entitlement", { studentCode: student.code });
  console.log(`[Test 9] MCP check_entitlement tool output preview:`);
  console.log(mcpResult.content[0].text.split("\n").slice(0, 5).join("\n"));

  console.log("\n=== ALL 9 INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
