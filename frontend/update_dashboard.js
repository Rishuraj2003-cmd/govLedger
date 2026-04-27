const fs = require('fs');

const path = '/Users/rishuraj/Documents/Codex/2026-04-24/build-a-complete-production-style-web3/frontend/src/pages/DashboardPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the tab === "admin" wrapper
content = content.replace(
  `{tab === "admin" && user.role === "ADMIN" ? (`,
  `{tab === "fund-management" && ["ADMIN", "DISTRICT", "DEPARTMENT"].includes(user.role) ? (`
);
content = content.replace(
  `<h2 className="text-2xl font-bold text-slate-900 mb-2">{t(language, "adminPanel")}</h2>`,
  `<h2 className="text-2xl font-bold text-slate-900 mb-2">Fund Management</h2>`
);

// Wrap Create Project for DISTRICT
content = content.replace(
  `<SectionCard title={t(language, "createProject")} subtitle="Setup a new government project">`,
  `{user.role === "DISTRICT" && (
                  <SectionCard title={t(language, "createProject")} subtitle="Setup a new district project">`
);
content = content.replace(
  `</button>\n                      </div>\n                    </form>\n                  </SectionCard>`,
  `</button>\n                      </div>\n                    </form>\n                  </SectionCard>\n                 )}`
);

// Modify Create Project form to remove department and hardcode it based on district? Wait, user.role == DISTRICT.
// We can leave the form as is for now, but hide department dropdown since district admin might not have department?
// Actually, District Admin is below Department Admin. Wait, the hierarchy is State -> Department -> District.
// So District admin creates project for a specific department? Yes, the project belongs to a department.

// Wrap Allocate Funds for ADMIN
content = content.replace(
  `<SectionCard title={t(language, "allocateFunds")} subtitle="Release budget from State">`,
  `{user.role === "ADMIN" && (
                  <SectionCard title={t(language, "allocateFunds")} subtitle="Release budget from State to Department">`
);
// Inside allocate funds, remove the "Allocate To (Role)" dropdown
content = content.replace(
  /<div className="grid grid-cols-2 gap-5">\s*<FormSelect label="Allocate To \(Role\)" required value=\{allocationForm\.receiverRole\} onChange=\{e => setAllocationForm\(c => \(\{...c, receiverRole: e\.target\.value, receiverName: "", receiverWallet: ""\} \)\)\}>\s*<option value="DISTRICT">District Official<\/option>\s*<option value="DEPARTMENT">Department Admin<\/option>\s*<\/FormSelect>\s*<NumberFormatInput label=\{t\(language, "amount"\)\} required value=\{allocationForm\.amount\} onChangeRaw=\{val => setAllocationForm\(c => \(\{...c, amount: val\}\)\)\} \/>\s*<\/div>/g,
  `<NumberFormatInput label={t(language, "amount")} required value={allocationForm.amount} onChangeRaw={val => setAllocationForm(c => ({...c, amount: val}))} />`
);
// And force receiverRole to be "DEPARTMENT" by changing the filter
content = content.replace(
  `users.filter(u => u.role === allocationForm.receiverRole)`,
  `users.filter(u => u.role === "DEPARTMENT")`
);
content = content.replace(
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>`,
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>\n                 )}`
);

// Wrap Transfer Funds for DEPARTMENT and DISTRICT
content = content.replace(
  `<SectionCard title={t(language, "transferFunds")} subtitle="Transfer down the pipeline">`,
  `{(user.role === "DEPARTMENT" || user.role === "DISTRICT") && (
                  <SectionCard title={t(language, "transferFunds")} subtitle={user.role === "DEPARTMENT" ? "Transfer to District" : "Transfer to Vendor/Project"}>`
);
// Modify senderRole / receiverRole logic
content = content.replace(
  /<div className="grid grid-cols-2 gap-5">\s*<FormSelect label="From \(Sender Role\)" required value=\{transferForm\.senderRole\} onChange=\{e => setTransferForm\(c => \(\{...c, senderRole: e\.target\.value\}\)\)\}>\s*<option value="ADMIN">State Admin<\/option>\s*<option value="DISTRICT">District<\/option>\s*<option value="DEPARTMENT">Department<\/option>\s*<\/FormSelect>\s*<FormSelect label="To \(Receiver Role\)" required value=\{transferForm\.receiverRole\} onChange=\{e => setTransferForm\(c => \(\{...c, receiverRole: e\.target\.value, receiverName: "", receiverWallet: ""\} \)\)\}>\s*<option value="DEPARTMENT">Department<\/option>\s*<option value="CONTRACTOR">Contractor<\/option>\s*<option value="VENDOR">Vendor<\/option>\s*<\/FormSelect>\s*<\/div>/g,
  `{/* Roles are auto-determined */}`
);
content = content.replace(
  `users.filter(u => u.role === transferForm.receiverRole)`,
  `users.filter(u => user.role === "DEPARTMENT" ? u.role === "DISTRICT" : (u.role === "VENDOR" || u.role === "CONTRACTOR"))`
);
content = content.replace(
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>`,
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>\n                 )}`
);

// Wrap Post Announcement for ADMIN
content = content.replace(
  `<SectionCard title="Post Announcement" subtitle="Broadcast updates to users">`,
  `{user.role === "ADMIN" && (
                  <SectionCard title="Post Announcement" subtitle="Broadcast updates to users">`
);
content = content.replace(
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>`,
  `</button>\n                        </div>\n                     </form>\n                  </SectionCard>\n                 )}`
);

fs.writeFileSync(path, content);
console.log('updated dashboard logic');
