/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var addTwoNumbers = function(l1, l2) {
  let pre = new ListNode(0);
  let cur = pre;
  let carry = 0;
  let temp = 0

  while (l1 || l2) {
   let one = l1 === null ? 0 : l1.val;
   let two = l2 === null ? 0 : l2.val;

   temp = one + two + carry;
   carry = temp / 10;
   cur.next = new ListNode(temp % 10);
   cur = cur.next

   if (l1 !== null) l1 = l1.next
   if (l2 !== null) l2 = l2.next
   if (carry > 0) cur.next = new ListNode(carry);

  }
  return pre.next 
};