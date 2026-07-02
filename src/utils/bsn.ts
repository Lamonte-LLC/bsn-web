export const getMatchStatusLabel = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "Programado";
    case "IN_PROGRESS":
      return "En progreso";
    case "FINISHED":
      return "Final";
    case "COMPLETE":
      return "Final";
    default:
      return status;
  }
};
