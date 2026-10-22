export function draftContentConfigBody(courseId, duration, topics) {
  return {
    courseId: courseId,
    customization: {
      id: null,
      configuration: {
        isComposite: true,
        duration: duration,
        topics: topics,
      },
    },
  };
}
