import team from "../../model/team.js";
import ExcelJS from "exceljs";

export async function exportTeamsToExcel(req, res) {
  try {
    // Fetch all teams with populated references
    const allTeams = await team
      .find()
      .populate("techSecy", "hostelId")
      .populate("ps", "name prep teamStrength points")
      .select("hostelId teamMembers submitted createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!allTeams || allTeams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teams found to export",
      });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("All Teams");

    // Define columns
    worksheet.columns = [
      { header: "Hostel ID", key: "hostelId", width: 15 },
      { header: "Problem Statement", key: "psName", width: 30 },
      { header: "PS Prep Level", key: "prep", width: 15 },
      { header: "Team Size", key: "teamSize", width: 12 },
      { header: "Max Team Size", key: "maxTeamSize", width: 15 },
      { header: "Points", key: "points", width: 10 },
      { header: "Submitted", key: "submitted", width: 12 },
      { header: "Member Name", key: "memberName", width: 25 },
      { header: "Member Email", key: "memberEmail", width: 30 },
      { header: "Year of Study", key: "yearOfStudy", width: 15 },
      { header: "Phone Number", key: "phoneNumber", width: 18 },
      { header: "Department", key: "department", width: 25 },
      { header: "Registered On", key: "registeredOn", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add data rows
    allTeams.forEach((teamData) => {
      const baseInfo = {
        hostelId: teamData.hostelId,
        psName: teamData.ps?.name || "N/A",
        prep: teamData.ps?.prep || "N/A",
        teamSize: teamData.teamMembers.length,
        maxTeamSize: teamData.ps?.teamStrength || "N/A",
        points: teamData.ps?.points || "N/A",
        submitted: teamData.submitted ? "Yes" : "No",
        registeredOn: new Date(teamData.createdAt).toLocaleDateString("en-IN"),
      };

      // Add a row for each team member
      teamData.teamMembers.forEach((member, index) => {
        worksheet.addRow({
          ...baseInfo,
          memberName: member.name,
          memberEmail: member.email,
          yearOfStudy: member.yearOfStudy,
          phoneNumber: member.phoneNumber,
          department: member.department,
        });
      });

      // Add an empty row between teams
      worksheet.addRow({});
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 13 },
    };

    // Set response headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=teams_export_${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error in exportTeamsToExcel:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export teams to Excel",
    });
  }
}
