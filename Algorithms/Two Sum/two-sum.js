/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  let arr = [], len = nums.length
  for (let item = 0; item < len; item++) {
    let temp = target - nums[item]
    if (arr[temp] !== undefined) return [arr[temp], item]
    arr[nums[item]] = item
  }
};