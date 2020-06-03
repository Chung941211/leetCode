/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var addTwoNumbers = function(l1, l2) {
  let pre = new ListNode(0);
  let cur = pre;
  let carry = 0;

  while (l1 || l2 || carry) {
   let one = 0;
   let two = 0;

   if(l1) one = l1.val, l1 = l1.next;
   if(l2) two = l2.val, l2 = l2.next;

   let sum = one + two + carry;
   carry = parseInt(sum / 10);
   pre.next = new ListNode(sum % 10)
   pre = pre.next
  }
  return cur.next 
};